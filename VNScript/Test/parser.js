// Lexer
let token = [
    // if, then, end, else
    {keyword:['nếu'], value:'if('},
    {keyword:['thì'], value:'){'},
    {keyword:['làm'], value:'){'},
    {keyword:['hết'], value:'}'},
    {keyword:['còn','không'], value:'else'},
    // init variables
    {keyword:['đặt'], value:'let'},
    // function and return
    {keyword:['thuật','toán'], value:'function'},
    {keyword:['trả','về'], value:'return'},
    // for loop and while loop
    {keyword:['với'], value:'for('},
    {keyword:['khi'], value:'while('},
    // and, or, in
    {keyword:['và'], value:'&&'},
    {keyword:['hoặc'], value:'||'},
    {keyword:['trong'], value:'in'},
    // true, false
    {keyword:['đúng'], value:'true'},
    {keyword:['sai'], value:'false'},
    // with
    {keyword:['với'], value:'with('},
    // try, catch, finally, throw
    {keyword:['thử'], value:'try{'},
    {keyword:['bắt','lỗi'], value:'catch('},
    // LỖI DỊCH {keyword:['gửi','lỗi'], value:'catch('},
]

let toán = Math

let scriptBefore = "viết (\"nếu\")"

scriptBefore = scriptBefore.replaceAll('\"',' \" ')
scriptBefore = scriptBefore.replaceAll('\\\"',' \\\" ')
scriptBefore = scriptBefore.replaceAll('\'',' \' ')
scriptBefore = scriptBefore.replaceAll('\\\'',' \\\' ')
scriptBefore = scriptBefore.replaceAll(";"," ; ")
scriptBefore = scriptBefore.replaceAll('(',' ( ')
scriptBefore = scriptBefore.replaceAll(')',' ) ')
scriptBefore = scriptBefore.replaceAll('=','= ')

console.log(scriptBefore)

let tokens = scriptBefore.split(" ")

let inDoubleQuotes = false
let indexOfDoubleQuotes = -1

let inSingleQuotes = false
let indexOfSingleQuotes = -1

let inBackQuotes = false
let indexOfBackQuotes = -1

for (let i = 0; i < tokens.length; i++) {

    // Double quotes
    if (tokens[i].includes("\"") && !tokens[i].includes("\\\"")) {
        inDoubleQuotes = !inDoubleQuotes
        
        if (inDoubleQuotes && indexOfDoubleQuotes == -1) {indexOfDoubleQuotes = i}
        if (!inDoubleQuotes) indexOfDoubleQuotes = -1
    }
    console.log(tokens[i],inDoubleQuotes)
    if (inDoubleQuotes) {
        tokens[indexOfDoubleQuotes] += tokens[i]; tokens[i] = i == indexOfDoubleQuotes ? '"' : ''
    }

    // Single quotes
    if (!inDoubleQuotes)
    {
        if (tokens[i].includes("\'") && !tokens[i].includes("\\\'")) {
            inSingleQuotes = !inSingleQuotes

            if (inSingleQuotes && indexOfSingleQuotes == -1) {indexOfSingleQuotes = i}
            if (!inSingleQuotes) indexOfSingleQuotes = -1
        }
        console.log(tokens[i],inSingleQuotes)
        if (inSingleQuotes) {
            tokens[indexOfSingleQuotes] += tokens[i]; tokens[i] = i == indexOfSingleQuotes ? '\'' : ''
        }
    }

    // ` quotes
    if (!inDoubleQuotes && !inSingleQuotes)
    {
        if (tokens[i].includes("\`") && !tokens[i].includes("\\\`")) {
            inBackQuotes = !inBackQuotes

            if (inBackQuotes && indexOfBackQuotes == -1) {indexOfBackQuotes = i}
            if (!inBackQuotes) indexOfBackQuotes = -1
        }
        console.log(tokens[i],inBackQuotes)
        if (inBackQuotes) {
            tokens[indexOfBackQuotes] += tokens[i]; tokens[i] = i == indexOfBackQuotes ? '`' : ''
        }
    }
}

console.log(tokens)

let scriptAfter = ''

function parser(tokens) {
    // for each token in tokens
    for (let i = 0; i < tokens.length; i++) {
        // user variable is things named by user, like name of function, name of variables, etc
        let isUserVariable = true
        /* 
         not ISV       ISV      not ISV
            |           |         |
        function       a()       { }
        */

        // for each object in token     
        for (let j = 0; j < token.length; j++) {            
            // if the keyword length is 1, check only 1 token
            if (token[j].keyword.length == 1 && tokens[i] == token[j].keyword) {
                console.log(tokens[i])
                scriptAfter += token[j].value + ' '
                isUserVariable = false
            } 
            // else, check if the whole chunk is right
            else if (tokens[i] == token[j].keyword[0] && tokens[i+1] == token[j].keyword[1]) {
                console.log(tokens[i],tokens[i+1])
                scriptAfter += token[j].value, tokens[i+1] = ''
                isUserVariable = false
            }            
        }
        // else, mean the token is custom by user
        if (isUserVariable && tokens[i] != '') {
            scriptAfter += tokens[i] + ' '
        }
    }
}
parser(tokens)
console.log(scriptAfter)