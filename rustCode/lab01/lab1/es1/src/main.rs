use std::env;
mod capitalize;

fn main() {
    let args: Vec<String> = env::args().collect();
    let s = &args[1];
    println!("Stringa: {}", capitalize::capitalize(s));
}

#[cfg(test)]
mod tests {
    use crate::capitalize::capitalize;

    #[test]
    fn test_multiple_words() {
        assert_eq!(capitalize("ciao mondo"), "Ciao Mondo");
    }
    #[test]
    fn test_one_word() {
        assert_eq!(capitalize("ciao"), "Ciao");
    }
    #[test]
    fn test_with_accents() {
        assert_eq!(
            capitalize("il sole è sorto, àèìòù"),
            "Il Sole È Sorto, Àèìòù"
        );
    }
    #[test]
    fn test_empty_string() {
        assert_eq!(capitalize(""), "");
    }
    #[test]
    fn test_multiple_spaces() {
        assert_eq!(capitalize("ciao   mondo"), "Ciao   Mondo");
    }
    #[test]
    fn test_nonascii() {
        assert_eq!(capitalize("ciao ß"), "Ciao SS");
    }
}