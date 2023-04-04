
pub fn annotate(minefield: &[&str]) -> Vec<String> {
    if minefield.is_empty() {
        return vec![];
    }
    let field = minefield.iter().map(|mine| mine.as_bytes()).collect::<Vec<_>>();
    let column = field[0].len();
    let rows = field.len();
    let mut modified_field = Vec::new();
    for (i, element) in field.iter().enumerate() {
        let mut str_row = String::new();
        for (j, ch) in element.iter().enumerate(){
            if *ch != b'*'{
                let mut count = 0;
                //control if there are * near the current position
                for x in i.saturating_sub(1)..=i+1{
                    for y in j.saturating_sub(1)..=j+1{
                        if x<rows && y<column && field[x][y] == b'*'{
                            count+=1;
                        }
                    }
                }
                if count>0{
                    str_row.push_str(&count.to_string());
                }
                else{
                    str_row.push_str(" ");
                }
            }
            else{
                str_row.push_str("*");
            }
        }
        modified_field.push(str_row);
    }

    modified_field
}
