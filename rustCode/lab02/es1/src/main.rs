use clap::Parser;
use std::os::raw::{c_char, c_int, c_long, c_float};
#[derive(Parser)]
struct Args {
    file_name: String,
}
#[repr(C)]
#[derive(Copy, Clone, Debug)]
struct ValueStruct {
    type_struct: c_int,
    value: c_int,
    timestamp: c_long,
}
#[repr(C)]
#[derive(Copy, Clone, Debug)]
struct MValueStruct {
    type_struct: c_int,
    val:[c_float; 10],
    timestamp: c_long,
}
#[repr(C)]
#[derive(Copy, Clone, Debug)]
struct MessageStruct {
    type_struct: c_int,
    message: [c_char; 21],
    timestamp: c_long,
}
#[repr(C)]
#[derive(Copy, Clone)]
union DataUnion {
    value: ValueStruct,
    mvalue: MValueStruct,
    message: MessageStruct,
}
impl std::fmt::Debug for DataUnion {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        unsafe{
            match self.value.type_struct {
                1 => write!(f, "{:?}", self.value),
                2 => write!(f, "{:?}", self.mvalue),
                3 => write!(f, "{:?}", self.message),
                _ => write!(f, "Unknown type_struct"),
            }
        }
    }
}
#[repr(C)]
#[derive(Copy, Clone, Debug)]
struct ExportData {
    type_struct: c_int,
    data: DataUnion,
}
fn main() {
    let args = Args::parse();
    let file_name = args.file_name;
    let bytes = std::fs::read(file_name).unwrap();
    let mut data:[ExportData; 100] = unsafe { std::mem::zeroed() };
    for i in 0..100{
        data[i] = unsafe { std::ptr::read(bytes.as_ptr().add(i * std::mem::size_of::<ExportData>()) as *const ExportData) };
    }
    for i in 0..100{
        println!("{:?}", data[i]);
    }
}