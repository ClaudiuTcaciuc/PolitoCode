pub fn capitalize(s: &str) -> String {
    let mut result = String::new();
    let mut capitalize_first = true;

    for letter in s.chars(){
        if capitalize_first {
            result.push_str(letter.to_uppercase().to_string().as_str());
            capitalize_first = false;
        } else {
            result.push(letter);
            if letter == ' ' {
                capitalize_first = true;
            }
        }
    }
    result
}
