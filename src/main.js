import ExcelJS from "exceljs";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import * as docx from "docx";
import "../app.js";

window.ExcelJS = ExcelJS;
window.JSZip = JSZip;
window.XLSX = XLSX;
window.saveAs = saveAs;
window.docx = docx;
