const editorContainer = document.querySelector('.editor-container');
        const runButton = document.getElementById('run-button');
        const outputContainer = document.getElementById('output-container');

        // Adjust the height of the run button on window resize
        window.addEventListener('resize', () => {
            const editorHeight = editorContainer.offsetHeight;
            const outputHeight = outputContainer.offsetHeight;

            // Set the height of the run button to the maximum of the editor and output container heights
            runButton.style.height = Math.max(editorHeight, outputHeight) + 'px';
        });

        // Initial adjustment on page load
        window.dispatchEvent(new Event('resize'));


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

        runButton.addEventListener('click', () => {
            const code = codeEditor.getValue();
            // Evaluate the code using a JavaScript interpreter
            try {
                const output = new Function(code)();
                outputContainer.textContent = output;
            } catch (error) {
                outputContainer.textContent = error.message;
            }
        });
