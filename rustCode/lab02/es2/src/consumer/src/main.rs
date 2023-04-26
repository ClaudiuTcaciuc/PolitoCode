use fcntl::{lock_file, unlock_file, FcntlLockType};
use lab02::{SensorData, MetaData};
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::io::SeekFrom;

const TOT_SENSOR: usize = 10;

fn main() {
    const DATASIZE: usize = std::mem::size_of::<SensorData>();
    const METASIZE: usize = std::mem::size_of::<MetaData>();

    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .open("sensor_data.bin")
        .unwrap();

    let mut metadata_buf = [0u8; METASIZE];
    let mut data_buf = vec![];

    loop {
        match lock_file (&file, None, Some(FcntlLockType::Write)) {
            Ok(true) => {},
            Ok(false) => {
                println!("Lock failed");
            },
            Err(err) => {
                println!("Lock failed with error: {}", err);
            },
        }

        file.seek(SeekFrom::Start(0)).unwrap();
        file.read_exact(&mut metadata_buf).unwrap();
        let mut metadata: MetaData = unsafe {
            std::mem::transmute::<[u8; METASIZE], MetaData>(metadata_buf)
        };
        println!("{:?}", metadata);

        let read_pos = METASIZE + (metadata.read_index as usize).checked_mul(DATASIZE).unwrap_or(0);
        let mut available_data = metadata.write_index.abs_diff(metadata.read_index) as usize;

        if available_data > TOT_SENSOR {
            available_data = TOT_SENSOR;
        }
        metadata.buffer_full = false;
        
        file.seek(SeekFrom::Start(read_pos as u64)).unwrap();
        for _ in 0..available_data {
            let mut buf = [0; DATASIZE];
            file.read_exact(&mut buf).unwrap();
            data_buf.push(unsafe {
                std::mem::transmute::<[u8; DATASIZE], SensorData>(buf)
            });

            metadata.read_index += 1;
            if metadata.read_index >= metadata.buffer_size {
                metadata.read_index = 0;
                file.seek(SeekFrom::Start(METASIZE as u64)).unwrap();
            }

        }

        let metadata_buf = unsafe {
            std::mem::transmute::<MetaData, [u8; METASIZE]>(metadata)
        };
        file.seek(SeekFrom::Start(0)).unwrap();
        file.write_all(&metadata_buf).unwrap();

        println!("{}", data_buf.len());

        data_buf.clear();
        match unlock_file(&file, None) {
            Ok(true) => {}
            Ok(false) => {
                println!("Unlock failed");
                continue;
            }
            Err(err) => {
                println!("Unlock failed with error: {}", err);
                continue;
            }
        }
        std::thread::sleep(std::time::Duration::from_secs(10));
    }
}
