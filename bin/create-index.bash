# create html list of all files in the current directory

# yaml parser
yaml() {
    python3 -c "import yaml;print(yaml.safe_load('''$1''')$2)"
}



# @TODO make them sorted by timestamp
for f in *.md;
do
    BASE_FILENAME=`basename "$f" .md`
    if [ $BASE_FILENAME == "index" ]; then
        continue
    fi

    #Define the string to split
    text=`cat $f`

    #Define multi-character delimiter
    delimiter="---"
    #Concatenate the delimiter with the main string
    string=$text$delimiter

    #Split the text based on the delimiter
    myarray=()
    while [[ $string ]]; do
        myarray+=( "${string%%"$delimiter"*}" )
        string=${string#*"$delimiter"}
    done

    # print value and index of each element
    for (( i=0; i<${#myarray[@]}; i++ )); do
        # echo "$i: ${myarray[$i]}"
        # if not empty and i=1 then extract the title from the yaml
        if [ ! -z "${myarray[$i]}" ] && [ $i -eq 1 ]; then
            yaml_front_matter=${myarray[$i]}
            link_title=$(yaml "$yaml_front_matter" "['title']")
        fi
    done

    # replace .md with .html in file name
    link_filename=$(echo $f | sed 's/\.md$/.html/')

    echo "- [$link_title](./$link_filename)"
done
