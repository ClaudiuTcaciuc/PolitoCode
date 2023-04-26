#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct SensorData {
    seq: u32,
    values: [f32; 10],
    timestamp: u32,
}
impl SensorData {
    pub fn new(seq: u32, values: [f32; 10], timestamp: u32) -> Self {
        SensorData {
            seq,
            values,
            timestamp,
        }
    }
}
#[derive(Debug, Copy, Clone)]
pub struct MetaData {
    pub read_index: u64,
    pub write_index: u64,
    pub buffer_size: u64,
    pub buffer_full: bool,
}
impl Default for MetaData {
    fn default() -> Self {
        MetaData {
            read_index: 0,
            write_index: 0,
            buffer_size: 10,
            buffer_full: false,
        }
    }
}
