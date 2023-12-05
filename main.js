const editorContainer = document.querySelector('.editor-container');
const runButton = document.getElementById('run-button');
const outputContainer = document.getElementById('output-container');

const codeEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'javascript',
    theme: 'base16-light',
    lineNumbers: true,
    indentWithTabs: true,
    matchBrackets: true,
    matchtags: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    tabSize: 2
});
codeEditor.setSize('100%', '100%')

let fileName
function downloadFile() {
    // Create a Blob object
    const blob = new Blob([codeEditor.getValue()], { type: "text/plain" });

    // Create an anchor tag
    const a = document.createElement("a");

    // Set href attribute to Blob URL
    a.href = window.URL.createObjectURL(blob);

    // Set download attribute with file name
    // if (!fileName) {fileName = prompt("Bạn muốn lưu file với tên gì?")}
    fileName = prompt("Bạn muốn lưu file với tên gì?")
    a.download = fileName + '.txt';

    // Trigger click event to download the file
    a.click();

    // Clean up after click
    window.URL.revokeObjectURL(a.href);
}

async function openFile() {
    // Show a native file selection dialog
    const files = await window.showOpenFilePicker({
        types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
        }],
    });

    // Ensure at least one file was selected
    if (!files || !files.length) {
        alert('No file selected!');
        return;
    }

    // Read the first file content
    const file = files[0];
    text = await file.getFile()
    const reader = new FileReader();
    const content = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(text.slice());
    });
    codeEditor.setValue(content)
}

/* 
__    __  ___  _  
\ \  / / |   \| |
 \ \/ /  | |\   |
  \__/   |_| \__|

*/

// Lexer
let token = [
    // if, then, end, else
    { keyword: ['nếu'], value: 'if(' },

    // {keyword:['thì'], value:')'},
    // {keyword:['rồi'], value:')'},
    // {keyword:['làm'], value:'{'},

    { keyword: ['làm'], value: '){' },
    { keyword: ['hết'], value: '}' },
    { keyword: ['còn', 'không'], value: '}else' },
    // init variables
    { keyword: ['đặt'], value: 'let' },
    { keyword: ['hằng'], value: 'const' },
    // function and return
    { keyword: ['thuật', 'toán'], value: 'function' },
    { keyword: ['trả', 'về'], value: 'return' },
    // for loop and while loop
    { keyword: ['với'], value: 'for(' },
    { keyword: ['khi'], value: 'while(' },
    // and, or, not, in
    { keyword: ['và'], value: '&&' },
    { keyword: ['hoặc'], value: '||' },
    { keyword: ['không', 'phải'], value: '!' },
    { keyword: ['trong'], value: 'in' },
    // true, false, null
    { keyword: ['đúng'], value: 'true' },
    { keyword: ['sai'], value: 'false' },
    { keyword: ['trống'], value: 'null' },
    // try, catch, finally, throw
    { keyword: ['thử'], value: 'try{' },
    { keyword: ['bắt', 'lỗi'], value: 'catch(' },
    { keyword: ['cuối', 'cùng'], value: 'finally{' },
    { keyword: ['khử', 'lỗi'], value: 'throw' },
    // import, from, export
    { keyword: ['lấy'], value: 'import' },
    { keyword: ['từ'], value: 'from' },
    { keyword: ['xuất'], value: 'export' },
    // break, continue
    { keyword: ['thoát'], value: 'break' },
    { keyword: ['tiếp', 'tục'], value: 'continue' },
    // switch, case, default
    { keyword: ['chuyển'], value: 'switch' },
    { keyword: ['trường', 'hợp'], value: 'case' },
    { keyword: ['mặc', 'định'], value: 'default' },
    // goto
    { keyword: ['đến'], value: 'goto' },
    // class
    { keyword: ['lớp'], value: 'class' },
    { keyword: ['loại'], value: 'class' },
    // enum
    { keyword: ['liệt', 'kê'], value: 'enum' },
    // new
    { keyword: ['mới'], value: 'new' },
]

let Toán = Math
// let dài = length
let scriptBefore = ''
let scriptAfter = ''

// Read comment bellow
let checkFunction = false

let báo = alert
// let nhập = prompt
let kho = localStorage
kho.lấy = kho.getItem
kho.đặt = kho.setItem
kho.xóa = kho.removeItem
kho.hủy = kho.clear
document.tìmID = document.getElementById
document.tìmTag = document.getElementsByTagName
document.tìmLoại = document.getElementsByClassName
document.tìmLớp = document.getElementsByClassName
Array.prototype.thêm = function (a) { this.push(a) };

function viết() {
    let out = ''
    for (i = 0; i < arguments.length; i++) { out += String(arguments[i] + ' ') }
    let terminal = document.getElementById("output-container"); terminal.appendChild(document.createElement("p")).innerHTML = out;
}

function nhập(e) {

    e = prompt(e)

    switch (e) {
        case 'đúng': e = 'true'; break
        case 'sai': e = 'false'; break
        case 'trống': e = 'null'; break
        default: e = e;
    }
    try { e = eval(e) } catch (error) { e = e }
    return e
}

function parser(tokens) {
    scriptAfter = 'function dài(e){return e.length};'

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
                scriptAfter += token[j].value + ' '
                isUserVariable = false
            }
            // else, check if the whole chunk is right
            else if (tokens[i] == token[j].keyword[0] && tokens[i + 1] == token[j].keyword[1]) {

                scriptAfter += token[j].value, tokens[i + 1] = ''
                isUserVariable = false

                // Add { after create a new function to simplify the syntax
                // thuật toán a() làm hết => thuật toán a() hết
                // Auto add { to correct the grammar

                // This check if user create a new function
                if (token[j].value == "function") {
                    checkFunction = true
                }

            }
        }
        // else, mean the token is custom by user
        if (isUserVariable //&& tokens[i] != ''
        ) {
            scriptAfter += tokens[i] + ' '

            if (checkFunction && tokens[i] == ")") {
                checkFunction = false
                scriptAfter += "{"
            }
        }
    }
}

function clean() {
    let terminal = document.getElementById("output-container")
    terminal.querySelectorAll('p').forEach(e => {
        terminal.removeChild(e)
    })
}

function run() {
    clean()
    let scriptBefore = codeEditor.getValue()

    // scriptBefore = scriptBefore.replaceAll('\n', ' \n ')
    // scriptBefore = scriptBefore.replaceAll('\n  ', '\n ')
    // scriptBefore = scriptBefore.replaceAll('  \n', ' \n')

    // scriptBefore = scriptBefore.replaceAll('\"', ' \" ')
    // scriptBefore = scriptBefore.replaceAll('\"  ', '\" ')
    // scriptBefore = scriptBefore.replaceAll('  \"', ' \"')

    // scriptBefore = scriptBefore.replaceAll('\\\"', ' \\\" ')
    // scriptBefore = scriptBefore.replaceAll('\\\"  ', '\\\" ')
    // scriptBefore = scriptBefore.replaceAll('  \\\"', ' \\\"')

    // scriptBefore = scriptBefore.replaceAll('\'', ' \' ')
    // scriptBefore = scriptBefore.replaceAll('\'  ', '\' ')
    // scriptBefore = scriptBefore.replaceAll('  \'', ' \'')

    // scriptBefore = scriptBefore.replaceAll('\\\'', ' \\\' ')
    // scriptBefore = scriptBefore.replaceAll('\\\'  ', '\\\' ')
    // scriptBefore = scriptBefore.replaceAll('  \\\'', ' \\\'')

    // scriptBefore = scriptBefore.replaceAll(";", " ; ")
    // scriptBefore = scriptBefore.replaceAll(";  ", "; ")
    // scriptBefore = scriptBefore.replaceAll("  ;", " ;")

    // scriptBefore = scriptBefore.replaceAll('(', ' ( ')
    // scriptBefore = scriptBefore.replaceAll('(  ', '( ')
    // scriptBefore = scriptBefore.replaceAll('  (', ' (')

    // scriptBefore = scriptBefore.replaceAll(')', ' ) ')
    // scriptBefore = scriptBefore.replaceAll(')  ', ') ')
    // scriptBefore = scriptBefore.replaceAll('  )', ' )')

    // scriptBefore = scriptBefore.replaceAll('{', ' { ')
    // scriptBefore = scriptBefore.replaceAll('{  ', '{ ')
    // scriptBefore = scriptBefore.replaceAll('  {', ' {')

    // scriptBefore = scriptBefore.replaceAll('}', ' } ')
    // scriptBefore = scriptBefore.replaceAll('}  ', '} ')
    // scriptBefore = scriptBefore.replaceAll('  }', ' }')

    // scriptBefore = scriptBefore.replaceAll('[', ' [ ')
    // scriptBefore = scriptBefore.replaceAll('[  ', '[ ')
    // scriptBefore = scriptBefore.replaceAll('  [', ' [')

    // scriptBefore = scriptBefore.replaceAll(']', ' ] ')
    // scriptBefore = scriptBefore.replaceAll(']  ', '] ')
    // scriptBefore = scriptBefore.replaceAll('  ]', ' ]')

    // scriptBefore = scriptBefore.replaceAll(':', ' : ')
    // scriptBefore = scriptBefore.replaceAll(':  ', ': ')
    // scriptBefore = scriptBefore.replaceAll('  :', ' :')

    // scriptBefore = scriptBefore.replaceAll('=', '= ')
    // scriptBefore = scriptBefore.replaceAll('=  ', '= ')
    // scriptBefore = scriptBefore.replaceAll('= = =','===')
    // scriptBefore = scriptBefore.replaceAll('= =', '==')
    // scriptBefore = scriptBefore.replaceAll('= <', '=<')
    // scriptBefore = scriptBefore.replaceAll('= >', '=>')

    // scriptBefore = scriptBefore.replaceAll('+', '+ ')
    // scriptBefore = scriptBefore.replaceAll('+  ', '+ ')
    // scriptBefore = scriptBefore.replaceAll('+ =', '+=')
    // scriptBefore = scriptBefore.replaceAll('+ +', '++')

    // scriptBefore = scriptBefore.replaceAll('-', '- ')
    // scriptBefore = scriptBefore.replaceAll('-  ', '- ')
    // scriptBefore = scriptBefore.replaceAll('- =', '-=')
    // scriptBefore = scriptBefore.replaceAll('- -', '--')

    scriptBefore = scriptBefore.replaceAll('\n', ' \n ')
    scriptBefore = scriptBefore.replaceAll('\"', ' \" ')
    scriptBefore = scriptBefore.replaceAll('\\\"', ' \\\" ')
    scriptBefore = scriptBefore.replaceAll('\'', ' \' ')
    scriptBefore = scriptBefore.replaceAll('\\\'', ' \\\' ')
    scriptBefore = scriptBefore.replaceAll(";", " ; ")
    scriptBefore = scriptBefore.replaceAll('(', ' ( ')
    scriptBefore = scriptBefore.replaceAll(')', ' ) ')
    scriptBefore = scriptBefore.replaceAll('{', ' { ')
    scriptBefore = scriptBefore.replaceAll('}', ' } ')
    scriptBefore = scriptBefore.replaceAll('[', ' [ ')
    scriptBefore = scriptBefore.replaceAll(']', ' ] ')
    scriptBefore = scriptBefore.replaceAll(':', ' : ')
    scriptBefore = scriptBefore.replaceAll('=', '= ')
    scriptBefore = scriptBefore.replaceAll('+', '+ ')
    scriptBefore = scriptBefore.replaceAll('-', '- ')

    // Dont know why this work:)
    token.forEach(token_ => {
        token_.keyword.forEach(key => {
            scriptBefore = scriptBefore.replaceAll(key, key + ' ')
            scriptBefore = scriptBefore.replaceAll(key + '  ', key + ' ')
        })

    })

    let tokens = scriptBefore.split(" ")

    // fixed "nếu" -> "if("
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

            if (inDoubleQuotes && indexOfDoubleQuotes == -1) { indexOfDoubleQuotes = i }
            if (!inDoubleQuotes) indexOfDoubleQuotes = -1
        }
        if (inDoubleQuotes) {
            tokens[indexOfDoubleQuotes] += ' ' + tokens[i]; tokens[i] = i == indexOfDoubleQuotes ? '"' : ''
        }

        // Single quotes
        if (!inDoubleQuotes) {
            if (tokens[i].includes("\'") && !tokens[i].includes("\\\'")) {
                inSingleQuotes = !inSingleQuotes

                if (inSingleQuotes && indexOfSingleQuotes == -1) { indexOfSingleQuotes = i }
                if (!inSingleQuotes) indexOfSingleQuotes = -1
            }
            if (inSingleQuotes) {
                tokens[indexOfSingleQuotes] += ' ' + tokens[i]; tokens[i] = i == indexOfSingleQuotes ? '\'' : ''
            }
        }

        // ` quotes
        if (!inDoubleQuotes && !inSingleQuotes) {
            if (tokens[i].includes("\`") && !tokens[i].includes("\\\`")) {
                inBackQuotes = !inBackQuotes

                if (inBackQuotes && indexOfBackQuotes == -1) { indexOfBackQuotes = i }
                if (!inBackQuotes) indexOfBackQuotes = -1
            }
            if (inBackQuotes) {
                tokens[indexOfBackQuotes] += ' ' + tokens[i]; tokens[i] = i == indexOfBackQuotes ? '`' : ''
            }
        }
    }

    parser(tokens)

    scriptAfter = scriptAfter.replaceAll(' \n ', '\n')
    scriptAfter = scriptAfter.replaceAll('  \" ', '\"')
    scriptAfter = scriptAfter.replaceAll('  \\\" ', '\\\"')
    scriptAfter = scriptAfter.replaceAll('  \' ', '\'')
    scriptAfter = scriptAfter.replaceAll('  \\\' ', '\\\'')
    scriptAfter = scriptAfter.replaceAll(" ; ", ";")
    scriptAfter = scriptAfter.replaceAll(' ( ', '(')
    scriptAfter = scriptAfter.replaceAll(' ) ', ')')
    scriptAfter = scriptAfter.replaceAll(' { ', '{')
    scriptAfter = scriptAfter.replaceAll(' } ', '}')
    scriptAfter = scriptAfter.replaceAll(' [ ', '[')
    scriptAfter = scriptAfter.replaceAll(' ] ', ']')
    scriptAfter = scriptAfter.replaceAll(' : ', ':')
    scriptAfter = scriptAfter.replaceAll('= ', '=')
    scriptAfter = scriptAfter.replaceAll('+ ', '+')
    scriptAfter = scriptAfter.replaceAll('- ', '-')

    try {
        eval(scriptAfter)
    }
    catch (error) {
        console.log(error.stack)
        // let text = ''+error.stack

        // console.log(error.message)
        // console.log(test = error.stack - error.message)
        // console.log(text.indexOf("<anonymous>:"))
        // console.log(text[text.indexOf("<anonymous>:")+12])

        let terminal = document.getElementById("output-container")
        let p = terminal.appendChild(document.createElement("p"))
        p.innerHTML = "Lỗi!!!";
        p.style = "color: red"
    }

    console.log(scriptAfter)
}
