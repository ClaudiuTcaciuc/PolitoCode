use fcntl::{lock_file, unlock_file, FcntlLockType};

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct SensorData {
    seq: u32,
    values: [f32; 10],
    timestamp: u32
}
impl SensorData {
    pub fn new(seq: u32, values: [f32; 10], timestamp: u32) -> Self {
        SensorData {
            seq,
            values,
            timestamp
        }
    }
}