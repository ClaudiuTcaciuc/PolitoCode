use std::fs::File;
use std::io::Write;
use lab02::SensorData;
use rand::Rng;

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

fn main() {
    let mut file = File::create("sensor_data.bin").unwrap();
    let mut seq: u32 = 0;
    loop {
        let data = produce_sensor_data(seq);
        if seq == 9 { seq = 0; }
        else{ seq += 1; }
        file.write_all(unsafe {
            std::slice::from_raw_parts(
                &data as *const SensorData as *const u8,
                std::mem::size_of::<SensorData>()
            )
        }).unwrap();
        std::thread::sleep(std::time::Duration::from_secs(1));
        println!("{:?}", data);
    } 
}
