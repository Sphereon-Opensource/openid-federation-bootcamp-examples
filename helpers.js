import readline from 'readline';

export const prompt = (query) => new Promise((resolve) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

export const drawBox = (title, lines, width = 50) => {
    const topBorder = '╔' + '═'.repeat(width - 2) + '╗';
    const bottomBorder = '╚' + '═'.repeat(width - 2) + '╝';

    console.log('\n=== ' + title + ' ===');
    console.log(topBorder);
    lines.forEach(line => {
        const paddedLine = line.padEnd(width - 4);
        console.log('║ ' + paddedLine + ' ║');
    });
    console.log(bottomBorder + '\n');
};