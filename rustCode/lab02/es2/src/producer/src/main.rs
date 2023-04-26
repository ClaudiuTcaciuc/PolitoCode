use fcntl::{lock_file, unlock_file, FcntlLockType};
use lab02::{SensorData, MetaData};
use rand::Rng;
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::io::SeekFrom;

fn produce_sensor_data(seq: u32) -> SensorData {
    let mut rng = rand::thread_rng();
    let values: [f32; 10] = [rng.gen_range(0.0..100.0); 10];
    let timestamp: u32 = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as u32;
    let data = SensorData::new(seq, values, timestamp);
    data
}

fn seq_order(seq: u32) -> u32 {
    if seq == 9 {
        0
    } else {
        seq + 1
    }
}

fn main() {
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open("sensor_data.bin")
        .unwrap();

    const DATASIZE: usize = std::mem::size_of::<SensorData>();
    const METASIZE: usize = std::mem::size_of::<MetaData>();
    let mut seq: u32 = 0;
    let mut buf = [0; METASIZE];

    

    loop {
        match lock_file (&file, None, Some(FcntlLockType::Write)) {
            Ok(true)=> {},
            Ok(false) => {
                println!("Can't lock file");
            },
            Err(err) => {
                println!("Error: {}", err);
                std::process::exit(1);
            },
        }
        file.seek(SeekFrom::Start(0)).unwrap();
        let mut metadata = match file.read_exact(&mut buf) {
            Ok(_) => unsafe { std::mem::transmute::<[u8; METASIZE], MetaData>(buf) },
            Err(_) => MetaData::default()
        };

        if metadata.write_index == metadata.buffer_size-1 && metadata.buffer_full == false && metadata.read_index.abs_diff(metadata.write_index) >= 9 {
            metadata.buffer_full = true;
            println!("Buffer full");
        }
        
        if !metadata.buffer_full {
            let data = produce_sensor_data(seq);
            seq = seq_order(seq);
            let data_buf = unsafe { std::mem::transmute::<SensorData, [u8; DATASIZE]>(data) };

            let write_pos = METASIZE + (metadata.write_index as usize) * DATASIZE;
            file.seek(std::io::SeekFrom::Start(write_pos as u64)).unwrap();
            file.write_all(&data_buf).unwrap();

            metadata.write_index = (metadata.write_index + 1) % metadata.buffer_size;
        }
        let metadata_buf = unsafe {
            std::mem::transmute::<MetaData, [u8; METASIZE]>(metadata)
        };

        file.seek(std::io::SeekFrom::Start(0)).unwrap();
        file.write_all(&metadata_buf).unwrap();

        println!("{:?}", metadata);
        match unlock_file (&file, None) {
            Ok(true) => {},
            Ok(false) => {
                println!("Unlock failed");
            },
            Err(err) => {
                println!("Unlock failed with error: {}", err);
            },
        }
        std::thread::sleep(std::time::Duration::from_secs(1));
    }
}
