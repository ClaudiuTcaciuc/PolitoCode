use luhn::is_valid;
use clap::Parser;
#[derive(Parser)]
struct Args {
    number: String,
}
fn main(){
    let card_number = Args::parse().number;
    for (i,c) in card_number.chars().enumerate() {
        if i%4 == 0{
            if !(c == ' ')
            {
                println!("Invalid card written format");
                return;
            }
        }
    }
    if is_valid(&card_number) {
        println!("Valid card number");
    }
    else {
        println!("Invalid card number");
    }
}