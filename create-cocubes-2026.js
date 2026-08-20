const XLSX = require("xlsx");
const fs = require("fs");

const input = "./data/2026 COCUBES DATA.xlsx";
const output = "./data/cocubes-2026.json";

const wb = XLSX.readFile(input);
const ws = wb.Sheets["Sheet1"];

const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: ""
});

const tests = [
    ["Domain Test", 6],
    ["English Usage", 9],
    ["Quantitative Aptitude", 12],
    ["Analytical Reasoning", 15],
    ["Computer Fundamentals", 18],
    ["Written English Test", 21],
    ["Coding", 24]
];

const data = rows.slice(2).map(row => {
    const record = {
        "S.No": row[0],
        "Roll Number": row[1],
        "Name": row[2],
        "Department": row[3],
        "Degree": row[4],
        "Location": row[5]
    };

    for (const [testName, start] of tests) {
        record[testName] = {
            "Pre 1": row[start] || "",
            "Post 1": row[start + 1] || "",
            "Post 2": row[start + 2] || ""
        };
    }

    return record;
});

fs.writeFileSync(
    output,
    JSON.stringify(data, null, 2),
    "utf8"
);

console.log("SUCCESS");
console.log("Output:", output);
console.log("Records:", data.length);
