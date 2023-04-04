use minesweeper::annotate;
use clap::Parser;

#[derive(Parser)]
struct Args {
    #[arg(short, long)]
    rows: usize,
    #[arg(short, long)]
    cols: usize,
    field: String,
}

fn main() {
    let args = Args::parse();
    //trasform the string into a vector of strings
    let input_field = args.field.chars().collect::<Vec<char>>().chunks(args.cols)
        .map(|chunk| chunk.iter().collect::<String>())
        .collect::<Vec<String>>();
    let field: Vec<&str> = input_field.iter().map(|s| s.as_str()).collect();
    let output_field = annotate(&field);
    for row in output_field {
        println!("{};", row);
    }
}
