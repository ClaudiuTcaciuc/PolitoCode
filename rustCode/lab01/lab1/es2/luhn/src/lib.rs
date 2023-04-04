/// Check a Luhn checksum.
pub fn is_valid(code: &str) -> bool {
    let mut sum = 0;
    let mut n;
    // Remove spaces
    let code = code.replace(" ", "");
    if code.len() <= 1 {
        return false;
    }
    // Check if all characters are digits
    for c in code.chars(){
        if !c.is_ascii_digit() {
            return false;
        }
    }
    for (i, c) in code.chars().rev().enumerate(){
        if i%2 == 1 {
            n = c.to_digit(10).unwrap() * 2;
            if n>9 {
                n -= 9;
            }
        }
        else {
            n = c.to_digit(10).unwrap();
        }
        sum+=n;
    }
    if sum%10 == 0 {
        return true;
    }
    else {
        return false;
    }
}

