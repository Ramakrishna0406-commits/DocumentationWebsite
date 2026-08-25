
/* ============================================================
   CT3 EXCEL PREVIEW SYSTEM
   ============================================================ */

window.ct3ExcelPreviewData = {

    performanceBand: null,
    weekPerformance: null
};

window.previewCT3Excel = function(type) {

    const inputId =
        type === "performanceBand"
            ? "performanceBandExcel"
            : "weekPerformanceExcel";

    const previewId =
        type === "performanceBand"
            ? "performanceBandPreview"
            : "weekPerformancePreview";

    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (!input || !preview) {
        alert("Upload control not found.");
        return;
    }

    if (!input.files || input.files.length === 0) {
        alert("Please select an Excel file first.");
        return;
    }

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function(event) {

        try {

            const data = new Uint8Array(event.target.result);

            const workbook = XLSX.read(data, {\r\n                type: "array",\r\n                cellStyles: true\r\n            });

            if (!workbook.SheetNames.length) {
                throw new Error("No worksheet found.");
            }

            const sheetName = workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];

            const rows = XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    defval: ""
                }
            );

            if (!rows || rows.length === 0) {
                throw new Error("The Excel sheet is empty.");
            }

            window.ct3ExcelPreviewData[type] = {
                fileName: file.name,
                sheetName: sheetName,
                rows: rows,
                worksheet: worksheet,
                excelWorksheet: worksheet
            };

            renderCT3Preview(
                preview,
                rows,
                file.name,
                sheetName,
                worksheet
            );

        } catch (error) {

            console.error(
                "CT3 Excel preview error:",
                error
            );

            preview.innerHTML =
                '<div style="color:red;font-weight:bold;">' +
                'Unable to read this Excel file.' +
                '</div>';

            alert(
                "Unable to read the Excel file. " +
                "Please check that it is a valid Excel file."
            );
        }
    };

    reader.onerror = function() {

        alert(
            "Unable to read the selected file."
        );

    };

    reader.readAsArrayBuffer(file);
}


function renderCT3Preview(container, rows, fileName, sheetName, excelWorksheet) {

    if (container.id === "performanceBandPreview") {

        const table = document.getElementById("performanceBandTable");
        const body = document.getElementById("performanceBandBody");

        if (!table || !body || !rows || rows.length === 0) return;

        const thead = table.querySelector("thead");

        if (!thead) return;

        thead.innerHTML = "";
        body.innerHTML = "";

        const titleRow = document.createElement("tr");
        const titleCell = document.createElement("th");

        titleCell.colSpan = rows[0].length;
        titleCell.textContent =
            "Preview: " + fileName + " | Sheet: " + sheetName;

        titleRow.appendChild(titleCell);
        thead.appendChild(titleRow);

        const headerRow = document.createElement("tr");

        rows[0].forEach(function(value) {

            const th = document.createElement("th");

            th.textContent =
                value === null || value === undefined
                    ? ""
                    : String(value);

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        for (let i = 1; i < rows.length; i++) {

            const tr = document.createElement("tr");
            const row = rows[i];

            for (let j = 0; j < rows[0].length; j++) {

                const td = document.createElement("td");

                const value =
                    row[j] === null || row[j] === undefined
                        ? ""
                        : row[j];

                td.textContent = String(value);
                tr.appendChild(td);
            }

            body.appendChild(tr);
        }

        container.innerHTML = "";
        return;
    }

    container.innerHTML = "";

    const title = document.createElement("div");

    title.className = "ct3-preview-title";

    title.textContent =
        "Preview: " + fileName + " | Sheet: " + sheetName;

    container.appendChild(title);

    const table = document.createElement("table");

    table.className = "ct3-dynamic-table";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    if (rows.length > 0) {

        const headerRow = document.createElement("tr");

        rows[0].forEach(function(value) {

            const th = document.createElement("th");

            th.textContent =
                value === null || value === undefined
                    ? ""
                    : String(value);

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
    }

    for (let i = 1; i < rows.length; i++) {

        const tr = document.createElement("tr");
        const row = rows[i];

        for (let j = 0; j < rows[0].length; j++) {

            const td = document.createElement("td");

            const value =
                row[j] === null || row[j] === undefined
                    ? ""
                    : row[j];

            td.textContent = String(value);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    container.appendChild(table);

    if (excelWorksheet) {
        applyCT3ExcelFormatting(table, excelWorksheet);
    }
}
function cancelCT3Excel(type) {

    const inputId =
        type === "performanceBand"
            ? "performanceBandExcel"
            : "weekPerformanceExcel";

    const previewId =
        type === "performanceBand"
            ? "performanceBandPreview"
            : "weekPerformancePreview";

    const input =
        document.getElementById(inputId);

    const preview =
        document.getElementById(previewId);

    if (input) {
        input.value = "";
    }

    if (preview) {
        preview.innerHTML = "";
    }

    window.ct3ExcelPreviewData[type] = null;

    console.log(
        "CT3 Excel preview cancelled:",
        type
    );
}

/* ============================================================
   END CT3 EXCEL PREVIEW SYSTEM
   ============================================================ */


