document.addEventListener('DOMContentLoaded', function() {
    const russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const alphabetIndex = {};

    for(let i = 0; i < russianAlphabet.length; i++) {
        alphabetIndex[russianAlphabet[i]] = i;
    }

    const algoOptions = document.querySelectorAll('.algo-option');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const keyInput = document.getElementById('key');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    const visualization = document.getElementById('visualization');
    const railViz = document.getElementById('railViz');
    const vigenereViz = document.getElementById('vigenereViz');
    const totalCount = document.getElementById('totalCount');
    const russianCount = document.getElementById('russianCount');
    const resultCount = document.getElementById('resultCount');

    let currentAlgorithm = 'rail';

    algoOptions.forEach(option => {
        option.addEventListener('click', function() {
            algoOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            currentAlgorithm = this.dataset.algo;

            if (currentAlgorithm === 'rail') {
                keyInput.placeholder = 'Введите число (высоту изгороди)';
            } else {
                keyInput.placeholder = 'Введите слово (ключ)';
            }

            clearMessage();
            visualization.style.display = 'none';
        });
    });

    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + (isError ? 'error' : 'success');
        messageDiv.style.display = 'block';
    }

    function clearMessage() {
        messageDiv.style.display = 'none';
    }

    function filterRussianText(text) {
        return text.toUpperCase().replace(/[^А-ЯЁ]/g, '');
    }

    function updateCounters() {
        const text = inputText.value;
        const filtered = filterRussianText(text);

        totalCount.textContent = text.length;
        russianCount.textContent = filtered.length;
        resultCount.textContent = outputText.value.length;
    }

    function railEncrypt(text, key) {
        const filteredText = filterRussianText(text);
        if (!filteredText) throw new Error('Текст должен содержать русские буквы');

        const keyNum = parseInt(key);
        if (isNaN(keyNum) || keyNum < 1) throw new Error('Ключ должен быть числом не менее 1');

        if (keyNum > 100) throw new Error('Ключ не должен превышать 100');

        if (keyNum === 1) {
            showRailViz(filteredText, 1);
            return filteredText;
        }

        const rails = Array(keyNum).fill().map(() => []);
        let rail = 0;
        let direction = 1;

        for (let i = 0; i < filteredText.length; i++) {
            rails[rail].push({char: filteredText[i], index: i});

            if (rail === 0) {
                direction = 1;
            } else if (rail === keyNum - 1) {
                direction = -1;
            }

            rail += direction;
        }

        let result = '';
        rails.forEach(rail => {
            rail.forEach(cell => {
                result += cell.char;
            });
        });

        showRailViz(filteredText, keyNum);
        return result;
    }

    function railDecrypt(text, key) {
        const filteredText = filterRussianText(text);
        if (!filteredText) throw new Error('Текст должен содержать русские буквы');

        const keyNum = parseInt(key);
        if (isNaN(keyNum) || keyNum < 1) throw new Error('Ключ должен быть числом не менее 1');

        if (keyNum === 1) {
            showRailViz(filteredText, 1);
            return filteredText;
        }

        const rails = Array(keyNum).fill().map(() => []);
        let rail = 0;
        let direction = 1;

        for (let i = 0; i < filteredText.length; i++) {
            rails[rail].push({index: i});

            if (rail === 0) {
                direction = 1;
            } else if (rail === keyNum - 1) {
                direction = -1;
            }

            rail += direction;
        }

        let index = 0;
        for (let i = 0; i < keyNum; i++) {
            for (let j = 0; j < rails[i].length; j++) {
                rails[i][j].char = filteredText[index++];
            }
        }

        const resultArray = new Array(filteredText.length);
        rail = 0;
        direction = 1;

        for (let i = 0; i < filteredText.length; i++) {
            const cell = rails[rail].shift();
            resultArray[cell.index] = cell.char;

            if (rail === 0) {
                direction = 1;
            } else if (rail === keyNum - 1) {
                direction = -1;
            }

            rail += direction;
        }

        showRailViz(filteredText, keyNum);
        return resultArray.join('');
    }

    function showRailViz(text, key) {
        railViz.innerHTML = '';
        vigenereViz.innerHTML = '';
        visualization.style.display = 'block';
        vigenereViz.style.display = 'none';
        railViz.style.display = 'block';

        if (key === 1) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'rail-row';

            for (let col = 0; col < text.length; col++) {
                const cell = document.createElement('div');
                cell.className = 'rail-cell filled';
                cell.textContent = text[col];
                rowDiv.appendChild(cell);
            }

            railViz.appendChild(rowDiv);
            return;
        }

        const rails = Array(key).fill().map(() => Array(text.length).fill(''));
        let rail = 0;
        let direction = 1;

        for (let i = 0; i < text.length; i++) {
            rails[rail][i] = text[i];

            if (rail === 0) {
                direction = 1;
            } else if (rail === key - 1) {
                direction = -1;
            }

            rail += direction;
        }

        for (let row = 0; row < key; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'rail-row';

            for (let col = 0; col < text.length; col++) {
                const cell = document.createElement('div');
                cell.className = 'rail-cell';

                if (rails[row][col] !== '') {
                    cell.textContent = rails[row][col];
                    cell.classList.add('filled');
                }

                rowDiv.appendChild(cell);
            }

            railViz.appendChild(rowDiv);
        }
    }

    function generateProgressiveKey(baseKey, length) {
        const filteredKey = filterRussianText(baseKey);
        if (!filteredKey) throw new Error('Ключ должен содержать русские буквы');

        let resultKey = '';
        let currentKey = filteredKey;

        for (let i = 0; i < length; i++) {
            if (i % filteredKey.length === 0 && i !== 0) {
                currentKey = currentKey.split('').map(char => {
                    const index = alphabetIndex[char];
                    const newIndex = (index + 1) % russianAlphabet.length;
                    return russianAlphabet[newIndex];
                }).join('');
            }

            resultKey += currentKey[i % currentKey.length];
        }

        return resultKey;
    }

    function vigenereEncrypt(text, key) {
        const filteredText = filterRussianText(text);
        if (!filteredText) throw new Error('Текст должен содержать русские буквы');

        const progressiveKey = generateProgressiveKey(key, filteredText.length);
        let result = '';

        for (let i = 0; i < filteredText.length; i++) {
            const textIndex = alphabetIndex[filteredText[i]];
            const keyIndex = alphabetIndex[progressiveKey[i]];
            const newIndex = (textIndex + keyIndex) % russianAlphabet.length;
            result += russianAlphabet[newIndex];
        }

        showVigenereViz(filteredText, progressiveKey, result, true);
        return result;
    }

    function vigenereDecrypt(text, key) {
        const filteredText = filterRussianText(text);
        if (!filteredText) throw new Error('Текст должен содержать русские буквы');

        const progressiveKey = generateProgressiveKey(key, filteredText.length);
        let result = '';

        for (let i = 0; i < filteredText.length; i++) {
            const textIndex = alphabetIndex[filteredText[i]];
            const keyIndex = alphabetIndex[progressiveKey[i]];
            let newIndex = (textIndex - keyIndex) % russianAlphabet.length;
            if (newIndex < 0) newIndex += russianAlphabet.length;
            result += russianAlphabet[newIndex];
        }

        showVigenereViz(filteredText, progressiveKey, result, false);
        return result;
    }

    function showVigenereViz(text, key, result, isEncrypt) {
        railViz.innerHTML = '';
        vigenereViz.innerHTML = '';
        visualization.style.display = 'block';
        railViz.style.display = 'none';
        vigenereViz.style.display = 'block';

        const linesContainer = document.createElement('div');
        linesContainer.className = 'lines-container';

        function createAlignedLine(label, content) {
            const line = document.createElement('div');
            line.className = 'line';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'line-label';
            labelSpan.textContent = label;

            const contentSpan = document.createElement('span');
            contentSpan.className = 'line-content';

            for (let i = 0; i < content.length; i++) {
                const letterSpan = document.createElement('span');
                letterSpan.className = 'letter';
                letterSpan.textContent = content[i];
                contentSpan.appendChild(letterSpan);

            }

            line.appendChild(labelSpan);
            line.appendChild(contentSpan);
            return line;
        }


        linesContainer.appendChild(createAlignedLine('Текст:', text));
        linesContainer.appendChild(createAlignedLine('Ключ:', key));
        linesContainer.appendChild(createAlignedLine('Результат:', result));

        vigenereViz.appendChild(linesContainer);

        const tableContainer = document.createElement('div');
        tableContainer.className = 'vigenere-table-container';

        const table = document.createElement('table');
        table.className = 'vigenere-table';

        const headerRow = document.createElement('tr');
        const emptyHeader = document.createElement('th');
        emptyHeader.textContent = 'Т/К';
        headerRow.appendChild(emptyHeader);

        for (let i = 0; i < russianAlphabet.length; i++) {
            const th = document.createElement('th');
            th.textContent = russianAlphabet[i];
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        for (let i = 0; i < russianAlphabet.length; i++) {
            const row = document.createElement('tr');

            const keyCell = document.createElement('th');
            keyCell.textContent = russianAlphabet[i];
            row.appendChild(keyCell);

            for (let j = 0; j < russianAlphabet.length; j++) {
                const td = document.createElement('td');
                const newIndex = (i + j) % russianAlphabet.length;
                td.textContent = russianAlphabet[newIndex];
                row.appendChild(td);
            }

            table.appendChild(row);
        }

        tableContainer.appendChild(table);
        vigenereViz.appendChild(tableContainer);
    }

    clearBtn.addEventListener('click', function() {
        if (inputText.value === '' && keyInput.value === '') {
            showMessage('Ошибка: нет текста для очистки ', true);
        } else {
            inputText.value = '';
            keyInput.value = '';
            showMessage('Текст очищен');
        }
    });

    function processOperation(isEncrypt) {
        clearMessage();

        try {
            const text = inputText.value;
            const key = keyInput.value.trim();

            if (!text) throw new Error('Введите текст для обработки');
            if (!key) throw new Error('Введите ключ');

            let result;
            if (currentAlgorithm === 'rail') {
                if (isNaN(parseInt(key))) throw new Error('Для изгороди ключ должен быть числом');
                result = isEncrypt ? railEncrypt(text, key) : railDecrypt(text, key);
            } else {
                if (filterRussianText(key).length === 0) throw new Error('Для Виженера ключ должен содержать русские буквы');
                result = isEncrypt ? vigenereEncrypt(text, key) : vigenereDecrypt(text, key);
            }

            outputText.value = result;
            updateCounters();
            showMessage(isEncrypt ? 'Текст успешно зашифрован!' : 'Текст успешно расшифрован!');

        } catch (error) {
            showMessage('Ошибка: ' + error.message, true);
        }
    }

    encryptBtn.addEventListener('click', () => processOperation(true));
    decryptBtn.addEventListener('click', () => processOperation(false));

    saveBtn.addEventListener('click', function() {
        const text = outputText.value;
        if (!text) {
            showMessage('Нет данных для сохранения', true);
            return;
        }

        const algorithmName = currentAlgorithm === 'rail' ? 'rail_fence' : 'vigenere';
        const defaultName = `${algorithmName}_result.txt`;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage('Файл сохранен как ' + defaultName);
    });

    loadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            inputText.value = e.target.result;
            updateCounters();
            showMessage('Файл загружен: ' + file.name);
        };

        reader.onerror = function() {
            showMessage('Ошибка при чтении файла', true);
        };

        reader.readAsText(file, 'UTF-8');
        fileInput.value = '';
    });

    inputText.addEventListener('input', updateCounters);
    outputText.addEventListener('input', updateCounters);

    updateCounters();

    inputText.value = 'Это лабораторная работа по криптографии!';
    keyInput.value = '4';
    updateCounters();
});