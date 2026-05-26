const STORAGE_KEY = "highRiskMeasures";
const HAZARD_STORAGE_KEY = "hazardCheckRecords";
const HAZARD_DB_NAME = "toolsSiteDB";
const HAZARD_DB_VERSION = 1;
const HAZARD_STORE_NAME = "hazardCheckData";
const HAZARD_RECORD_KEY = "current";
const RECTIFICATION_FEEDBACK_KEY = "rectificationFeedback";
const GOVERNANCE_RECORD_KEY = "hazardGovernanceSystem";
const GOVERNANCE_LEDGER_DISPLAY_FIELDS_KEY = "governanceLedgerDisplayFields";
const GOVERNANCE_LEDGER_EXPORT_FIELDS_KEY = "governanceLedgerExportFields";
const MAX_PHOTO_WIDTH = 1600;
const PHOTO_QUALITY = 0.85;
const HAZARD_STORAGE_WARN_BYTES = 4 * 1024 * 1024;

const sampleMeasures = [
  {
    title: "掘进爆破作业",
    content: "1. 严格执行爆破作业审批制度；\n2. 爆破前确认警戒范围内人员全部撤离；\n3. 爆破器材领用、运输、使用符合规定；\n4. 爆破后按规定通风、检查，确认安全后方可进入作业面。"
  },
  {
    title: "高处作业",
    content: "1. 作业前办理高处作业审批手续；\n2. 作业人员正确佩戴安全帽、安全带；\n3. 安全带高挂低用，挂点牢固可靠；\n4. 作业区域设置警戒，严禁上下交叉作业。"
  },
  {
    title: "硫酸库卸酸作业",
    content: "1. 卸酸前检查管线、阀门、接头完好情况；\n2. 作业人员穿戴防酸碱手套、防护面罩、防酸服等防护用品；\n3. 卸酸过程中专人监护，严禁离岗；\n4. 现场配备应急冲淋、清水和应急处置物资。"
  },
  {
    title: "动火作业",
    content: "1. 作业前按规定办理动火作业审批手续；\n2. 清理动火点周边可燃物，配备灭火器材；\n3. 动火过程中安排专人监护；\n4. 作业结束后确认无余火、无复燃风险。"
  },
  {
    title: "吊装作业",
    content: "1. 作业前检查吊具、索具、起重设备完好情况；\n2. 吊装区域设置警戒，严禁无关人员进入；\n3. 起吊过程中统一指挥，严禁人员站在吊物下方；\n4. 遇大风、视线不良等情况停止吊装作业。"
  },
  {
    title: "受限空间作业",
    content: "1. 作业前办理受限空间作业审批手续；\n2. 作业前进行通风、检测氧气及有毒有害气体浓度；\n3. 作业过程中专人监护，保持通讯畅通；\n4. 现场配备应急救援器材，严禁盲目施救。"
  },
  {
    title: "临时用电作业",
    content: "1. 临时用电线路由专业人员规范接设；\n2. 配电箱、开关箱设置漏电保护装置；\n3. 电缆线架空或采取防碾压、防破损措施；\n4. 作业结束后及时拆除临时用电设施。"
  }
];

const tools = {
  home: {
    title: "首页",
    icon: "⌂",
    render: renderHome
  },
  highRisk: {
    title: "高风险作业管控措施",
    icon: "✓",
    render: renderHighRiskTool
  },
  hazardCheck: {
    title: "安全检查隐患采集",
    icon: "!",
    render: renderHazardCheckTool
  },
  hazardGovernance: {
    title: "隐患排查治理",
    icon: "治",
    render: renderHazardGovernanceModule
  },
  future: {
    title: "后续工具预留",
    icon: "+",
    render: renderFutureTools
  }
};

const state = {
  currentTool: "hazardGovernance",
  measures: [],
  editingId: null,
  keyword: "",
  editorOpen: false
};

const hazardState = {
  data: createEmptyHazardData(),
  editingId: null,
  draftPhotos: [],
  keyword: "",
  previewHazardId: null,
  mergeDraft: null,
  storageWarned: false
};

const reportState = {
  tasks: [],
  selectedTaskId: "",
  selectedTaskIds: [],
  feedback: {},
  config: createDefaultReportConfig()
};

const GOVERNANCE_LEDGER_FIELDS = [
  { key: "seq", label: "序号", displayDefault: true, exportDefault: true, value: (hazard, index) => index + 1, className: "field-seq" },
  { key: "checkType", label: "检查类型", exportDefault: true, value: (hazard) => hazard.checkType },
  { key: "checkNo", label: "检查编号", exportDefault: true, value: (hazard) => hazard.checkNo },
  { key: "hazardNo", label: "隐患编号", displayDefault: true, exportDefault: true, value: (hazard) => hazard.hazardNo, className: "field-hazardNo" },
  { key: "checkDate", label: "检查日期", displayDefault: true, exportDefault: true, value: (hazard) => hazard.checkDate, className: "field-checkDate" },
  { key: "checkPlace", label: "检查地点", exportDefault: true, value: (hazard) => hazard.checkPlace },
  { key: "problem", label: "问题隐患", displayDefault: true, exportDefault: true, value: (hazard) => hazard.problem, className: "table-problem field-problem" },
  { key: "hazardLevel", label: "隐患等级", exportDefault: true, value: (hazard) => hazard.hazardLevel },
  { key: "hazardType", label: "隐患类型", exportDefault: true, value: (hazard) => hazard.hazardType },
  { key: "professionalType", label: "专业类型", exportDefault: true, value: (hazard) => hazard.professionalType },
  { key: "rectificationMeasures", label: "整改措施", displayDefault: true, exportDefault: true, value: (hazard) => hazard.rectificationMeasures, className: "table-measure field-rectificationMeasures" },
  { key: "supervisionLeader", label: "督办领导", exportDefault: true, value: (hazard) => hazard.supervisionLeader },
  { key: "responsibleDept", label: "责任部门", displayDefault: true, exportDefault: true, value: (hazard) => hazard.responsibleDept, className: "field-responsibleDept" },
  { key: "responsiblePerson", label: "责任人", displayDefault: true, exportDefault: true, value: (hazard) => hazard.responsiblePerson, className: "field-responsiblePerson" },
  { key: "deadline", label: "整改期限", displayDefault: true, exportDefault: true, value: (hazard) => hazard.deadline, className: "field-deadline" },
  { key: "acceptor", label: "验收人", exportDefault: true, value: (hazard) => hazard.acceptor },
  { key: "handlingMeasures", label: "处理措施", exportDefault: true, value: (hazard) => hazard.handlingMeasures },
  { key: "currentStatus", label: "手动状态", exportDefault: true, value: (hazard) => hazard.currentStatus },
  { key: "autoStatus", label: "状态", displayDefault: true, exportDefault: true, value: (hazard) => hazard.autoStatus, className: "field-autoStatus" },
  { key: "platformCloseStatus", label: "平台闭环", displayDefault: true, exportDefault: true, value: (hazard) => hazard.platformCloseStatus, className: "field-platformCloseStatus" },
  { key: "extensionReason", label: "延期原因", value: (hazard) => hazard.extensionReason },
  { key: "extensionDeadline", label: "延期后期限", value: (hazard) => hazard.extensionDeadline },
  { key: "beforePhotoCount", label: "整改前照片数", value: (hazard) => (hazard.beforePhotos || []).length },
  { key: "afterPhotoCount", label: "整改后照片数", value: (hazard) => (hazard.afterPhotos || []).length },
  { key: "feedbackSource", label: "反馈来源", value: (hazard) => hazard.feedbackSource },
  { key: "createdAt", label: "创建时间", value: (hazard) => hazard.createdAt },
  { key: "updatedAt", label: "更新时间", value: (hazard) => hazard.updatedAt }
];

function getDefaultGovernanceLedgerFieldKeys(mode) {
  const defaultName = mode === "display" ? "displayDefault" : "exportDefault";
  return GOVERNANCE_LEDGER_FIELDS.filter((field) => field[defaultName]).map((field) => field.key);
}

function normalizeGovernanceLedgerFieldKeys(keys, mode) {
  const allowed = new Set(GOVERNANCE_LEDGER_FIELDS.map((field) => field.key));
  const normalized = Array.isArray(keys) ? keys.filter((key) => allowed.has(key)) : [];
  return normalized.length ? normalized : getDefaultGovernanceLedgerFieldKeys(mode);
}

function readStoredGovernanceLedgerFields(storageKey, mode) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return normalizeGovernanceLedgerFieldKeys(JSON.parse(raw), mode);
    }
  } catch (error) {
    console.warn("读取台账字段配置失败", error);
  }
  return getDefaultGovernanceLedgerFieldKeys(mode);
}

function saveGovernanceLedgerFields(storageKey, fields) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(fields));
  } catch (error) {
    console.warn("保存台账字段配置失败", error);
  }
}

function getSelectedGovernanceLedgerFields(mode) {
  const keys = mode === "display" ? governanceState.ledgerDisplayFields : governanceState.ledgerExportFields;
  const normalized = normalizeGovernanceLedgerFieldKeys(keys, mode);
  return normalized.map((key) => GOVERNANCE_LEDGER_FIELDS.find((field) => field.key === key)).filter(Boolean);
}

function getGovernanceLedgerFieldValue(field, hazard, index) {
  const value = typeof field.value === "function" ? field.value(hazard, index) : hazard[field.key];
  return value ?? "";
}

const governanceState = {
  data: null,
  activeTab: "dashboard",
  workflowFocus: "",
  selectedInspectionId: "",
  editingInspectionId: "",
  editingHazardId: "",
  ledgerKeyword: "",
  ledgerFieldSettingsOpen: false,
  ledgerDisplayFields: readStoredGovernanceLedgerFields(GOVERNANCE_LEDGER_DISPLAY_FIELDS_KEY, "display"),
  ledgerExportFields: readStoredGovernanceLedgerFields(GOVERNANCE_LEDGER_EXPORT_FIELDS_KEY, "export"),
  ledgerFilters: {
    checkTypeCode: "",
    checkNo: "",
    responsibleDept: "",
    currentStatus: "",
    autoStatus: "",
    platformCloseStatus: "",
    hazardLevel: "",
    hazardType: "",
    professionalType: ""
  },
  feedbackImportDraft: null
};

const app = document.querySelector("#app");
const nav = document.querySelector("#toolNav");
const mobileSelect = document.querySelector("#mobileToolSelect");
const mobileTitle = document.querySelector("#mobileTitle");
const toast = document.querySelector("#toast");
let toastTimer = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  state.measures = loadMeasures();
  renderNavigation();
  renderCurrentTool();
}

function renderNavigation() {
  nav.innerHTML = Object.entries(tools).map(([key, tool]) => `
    <button class="nav-button ${key === state.currentTool ? "active" : ""}" data-tool="${key}" type="button">
      <span class="nav-icon">${tool.icon}</span>
      <span>${tool.title}</span>
    </button>
  `).join("");

  mobileSelect.innerHTML = Object.entries(tools).map(([key, tool]) => `
    <option value="${key}" ${key === state.currentTool ? "selected" : ""}>${tool.title}</option>
  `).join("");

  nav.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => switchTool(button.dataset.tool));
  });

  mobileSelect.onchange = (event) => switchTool(event.target.value);
}

function switchTool(toolKey) {
  state.currentTool = toolKey;
  state.editingId = null;
  state.keyword = "";
  renderNavigation();
  renderCurrentTool();
}

async function renderCurrentTool() {
  const tool = tools[state.currentTool];
  mobileTitle.textContent = tool.title;
  app.classList.remove("content-view");
  void app.offsetWidth;
  app.classList.add("content-view");
  await tool.render();
}

function renderHome() {
  app.innerHTML = `
    <section class="hero glass">
      <span class="eyebrow">GitHub Pages 静态工具箱</span>
      <h2>把常用小工具集中放到一个清爽页面里。</h2>
      <p>当前已内置高风险作业管控措施复制工具，数据保存在当前浏览器本地。后续可以继续添加隐患整改、检查记录、排班、水印和文本模板等工具。</p>
      <div class="placeholder-grid">
        <div class="placeholder">高风险作业管控措施</div>
        <div class="placeholder">隐患整改清单工具</div>
        <div class="placeholder">检查记录生成工具</div>
        <div class="placeholder">值班排班工具</div>
        <div class="placeholder">图片水印工具</div>
        <div class="placeholder">文本模板复制工具</div>
      </div>
    </section>
  `;
}

function renderFutureTools() {
  app.innerHTML = `
    <section class="hero glass">
      <span class="eyebrow">预留扩展</span>
      <h2>新增工具时，只需要增加配置和渲染函数。</h2>
      <p>在 app.js 的 tools 对象中增加一个工具配置，再编写对应 render 函数即可接入左侧菜单和手机端切换器。</p>
    </section>
  `;
}

async function renderReportCenter() {
  app.innerHTML = `<section class="tool-card glass"><h2>报告生成中心</h2><p class="hint">正在读取检查任务和整改反馈...</p></section>`;
  reportState.tasks = await getInspectionTasks();
  reportState.feedback = await getAllRectificationFeedback();
  normalizeReportSelection();
  const combinedTask = getCombinedReportTask();
  reportState.config = createDefaultReportConfig(combinedTask, reportState.config);

  app.innerHTML = `
    <div class="tool-layout report-tool">
      <section class="tool-card glass">
        <div class="section-title">
          <div>
            <h2>报告生成中心</h2>
            <p class="hint">填写检查事项名称，勾选多个检查任务，汇总生成一张治理表和一份整改报告。</p>
          </div>
        </div>
        <div class="report-combine-panel">
          <label class="field">
            <span>检查事项名称</span>
            <input id="reportInspectionNameInput" class="input" type="text" value="${escapeAttr(reportState.config.inspectionName || "")}" placeholder="例如：安全环保综合检查">
          </label>
          <div class="report-selected-summary">
            <span>已选择 ${reportState.selectedTaskIds.length} 个任务</span>
            <span>共 ${combinedTask.hazards.length} 项隐患</span>
          </div>
          <div class="data-actions hazard-actions">
            <button id="importInspectionJsonButton" class="button" type="button">导入检查数据</button>
            <button id="importFeedbackJsonButton" class="button" type="button">导入反馈数据</button>
            <input id="inspectionImportFile" class="hidden" type="file" accept="application/json,.json" multiple>
            <input id="feedbackImportFile" class="hidden" type="file" accept="application/json,.json" multiple>
          </div>
        </div>
        <div class="report-actions-main">
          <button class="button" type="button" data-combined-report-action="governance">生成总治理表</button>
          <button class="button" type="button" data-combined-report-action="initial">生成初版整改报告</button>
          <button class="button primary" type="button" data-combined-report-action="rectify">进入汇总整改端</button>
          <button class="button" type="button" data-combined-report-action="final">生成最终整改报告</button>
          <button class="button" type="button" data-combined-report-action="export-task">导出所选检查数据</button>
          <button class="button" type="button" data-combined-report-action="export-feedback">导出整改反馈</button>
        </div>
      </section>

      ${renderReportConfigPanel()}
      ${renderGovernanceAssignmentPanel()}
      <section id="reportTaskPanel" class="hazard-list"></section>
      <section id="rectificationPanel" class="tool-card glass hidden"></section>
    </div>
  `;

  bindReportCenterEvents();
  renderReportTaskPanel();
}

function renderReportConfigPanel() {
  const config = reportState.config;
  return `
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>报告配置</h2>
          <p class="hint">用于治理表和整改报告的标题、抬头、落款等信息。</p>
        </div>
      </div>
      <form id="reportConfigForm" class="form-grid compact-form">
        ${[
          ["governanceNo", "治理表序号", config.governanceNo],
          ["checkedUnit", "被检查单位", config.checkedUnit],
          ["participants", "参检人员", config.participants],
          ["makerDepartment", "制表部门", config.makerDepartment],
          ["recipientDepartment", "送达部门", config.recipientDepartment],
          ["inspectionUnit", "检查单位", config.inspectionUnit],
          ["reportCompany", "落款单位", config.reportCompany],
          ["reportDate", "落款日期", config.reportDate]
        ].map(([id, label, value]) => `
          <label class="field">
            <span>${label}</span>
            <input id="${id}" class="input report-config-input" type="text" value="${escapeAttr(value || "")}">
          </label>
        `).join("")}
      </form>
    </section>
  `;
}

function renderGovernanceAssignmentPanel() {
  const task = getCombinedReportTask();
  if (!task) {
    return "";
  }

  return `
    <section class="tool-card glass governance-assignment-panel">
      <div class="section-title">
        <div>
          <h2>治理责任分配</h2>
          <p class="hint">为每项隐患填写督办领导、治理责任单位或部门、治理责任人和整改时限，生成治理表时自动带入。</p>
        </div>
      </div>

      <div class="governance-bulk">
        <div class="governance-bulk-grid">
          ${renderGovernanceAssignmentInput("bulkSupervisingLeader", "督办领导", "")}
          ${renderGovernanceAssignmentInput("bulkResponsibleUnit", "治理责任单位或部门", "")}
          ${renderGovernanceAssignmentInput("bulkResponsiblePerson", "治理责任人", "")}
          ${renderGovernanceAssignmentInput("bulkDeadline", "整改时限", "")}
        </div>
        <div class="governance-bulk-actions">
          <p class="field-tip">批量应用时，仅非空字段会覆盖已勾选任务中的全部隐患。</p>
          <button id="applyGovernanceBulkButton" class="button primary" type="button">批量应用到所选隐患</button>
        </div>
      </div>

      <div class="governance-assignment-list">
        ${task.hazards.map((hazard, index) => `
          <article class="governance-assignment-row" data-hazard-id="${escapeAttr(hazard.id)}">
            <div class="governance-hazard-title">
              <span>${index + 1}</span>
              <strong>${escapeHtml(hazard.problem || "未填写隐患")}</strong>
            </div>
            <div class="governance-assignment-grid">
              ${renderGovernanceAssignmentInput("supervisingLeader", "督办领导", hazard.supervisingLeader || "", hazard.id)}
              ${renderGovernanceAssignmentInput("responsibleUnit", "治理责任单位或部门", hazard.responsibleUnit || "", hazard.id)}
              ${renderGovernanceAssignmentInput("responsiblePerson", "治理责任人", hazard.responsiblePerson || "", hazard.id)}
              ${renderGovernanceAssignmentInput("deadline", "整改时限", hazard.deadline || "", hazard.id)}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGovernanceAssignmentInput(id, label, value, hazardId = "") {
  const fieldAttr = hazardId ? `data-assignment-field="${id}" data-hazard-id="${escapeAttr(hazardId)}"` : "";
  const idAttr = hazardId ? "" : `id="${id}"`;
  const className = hazardId ? "input governance-assignment-input" : "input governance-bulk-input";
  return `
    <label class="field">
      <span>${label}</span>
      <input ${idAttr} class="${className}" ${fieldAttr} type="text" value="${escapeAttr(value || "")}" placeholder="${label}">
    </label>
  `;
}

function bindReportCenterEvents() {
  document.querySelector("#reportInspectionNameInput")?.addEventListener("input", (event) => {
    reportState.config.inspectionName = event.target.value.trim();
    reportState.config.reportTitle = `关于落实${reportState.config.inspectionName || "安全检查"}意见的情况报告`;
  });
  document.querySelectorAll(".report-task-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      reportState.selectedTaskIds = Array.from(document.querySelectorAll(".report-task-checkbox:checked"))
        .map((item) => item.value);
      normalizeReportSelection();
      reportState.config = createDefaultReportConfig(getCombinedReportTask(), reportState.config);
      renderReportCenter();
    });
  });
  document.querySelectorAll(".report-config-input").forEach((input) => {
    input.addEventListener("input", () => {
      reportState.config[input.id] = input.value.trim();
    });
  });
  document.querySelector("#importInspectionJsonButton")?.addEventListener("click", () => document.querySelector("#inspectionImportFile").click());
  document.querySelector("#importFeedbackJsonButton")?.addEventListener("click", () => document.querySelector("#feedbackImportFile").click());
  document.querySelector("#inspectionImportFile")?.addEventListener("change", importInspectionDataFiles);
  document.querySelector("#feedbackImportFile")?.addEventListener("change", importFeedbackDataFiles);
  document.querySelector("#applyGovernanceBulkButton")?.addEventListener("click", applyGovernanceBulkValues);
  document.querySelectorAll("[data-combined-report-action]").forEach((button) => {
    button.addEventListener("click", () => handleCombinedReportAction(button.dataset.combinedReportAction));
  });
  document.querySelectorAll(".governance-assignment-input").forEach((input) => {
    input.addEventListener("change", () => updateHazardGovernanceField(
      input.dataset.hazardId,
      input.dataset.assignmentField,
      input.value.trim()
    ));
  });
}

async function updateHazardGovernanceField(hazardId, field, value) {
  const allowedFields = ["supervisingLeader", "responsibleUnit", "responsiblePerson", "deadline"];
  if (!hazardId || !allowedFields.includes(field)) {
    return;
  }

  const hazard = hazardState.data.hazards.find((item) => item.id === hazardId);
  if (!hazard) {
    showToast("未找到隐患记录");
    return;
  }

  hazard[field] = value;
  if (!(await trySaveHazardData())) {
    return;
  }
  showToast("治理责任已保存");
}

async function applyGovernanceBulkValues() {
  const values = {
    supervisingLeader: document.querySelector("#bulkSupervisingLeader")?.value.trim() || "",
    responsibleUnit: document.querySelector("#bulkResponsibleUnit")?.value.trim() || "",
    responsiblePerson: document.querySelector("#bulkResponsiblePerson")?.value.trim() || "",
    deadline: document.querySelector("#bulkDeadline")?.value.trim() || ""
  };
  const activeEntries = Object.entries(values).filter(([, value]) => value);

  if (!activeEntries.length) {
    showToast("请至少填写一项批量内容");
    return;
  }

  const task = getCombinedReportTask();
  if (!task) {
    showToast("请先选择检查任务");
    return;
  }

  const targetIds = new Set(task.hazards.map((hazard) => hazard.id));
  hazardState.data.hazards.forEach((hazard) => {
    if (targetIds.has(hazard.id)) {
      activeEntries.forEach(([field, value]) => {
        hazard[field] = value;
      });
    }
  });

  if (!(await trySaveHazardData())) {
    return;
  }
  showToast("批量修改成功");
  await renderReportCenter();
}

function normalizeReportSelection() {
  const availableIds = new Set(reportState.tasks.map((task) => task.id));
  reportState.selectedTaskIds = reportState.selectedTaskIds.filter((id) => availableIds.has(id));
  if (!reportState.selectedTaskIds.length && reportState.tasks.length) {
    reportState.selectedTaskIds = reportState.tasks.map((task) => task.id);
  }
  reportState.selectedTaskId = reportState.selectedTaskIds[0] || "";
}

function getSelectedReportTasks() {
  const selectedIds = new Set(reportState.selectedTaskIds);
  return reportState.tasks.filter((task) => selectedIds.has(task.id));
}

function getCombinedReportTask() {
  const tasks = getSelectedReportTasks();
  const hazards = tasks.flatMap((task) => task.hazards.map((hazard) => ({
    ...hazard,
    reportSourceTaskId: task.id,
    reportSourceTaskName: task.name
  })));
  const dates = [...new Set(tasks.map((task) => task.date).filter(Boolean))];
  const locations = [...new Set(tasks.map((task) => task.location).filter(Boolean))];
  const leaders = [...new Set(tasks.map((task) => task.leader).filter(Boolean))];
  const inspectionName = reportState.config.inspectionName || "安全环保综合检查";

  return {
    id: buildCombinedTaskId(tasks, inspectionName),
    name: `${inspectionName}汇总`,
    date: dates[0] || getTodayDate(),
    location: locations.length > 1 ? "多地点汇总" : (locations[0] || ""),
    leader: leaders.join("、"),
    inspectionInfo: {
      date: dates[0] || getTodayDate(),
      location: locations.length > 1 ? "多地点汇总" : (locations[0] || ""),
      leader: leaders.join("、")
    },
    sourceTasks: tasks,
    hazards
  };
}

function buildCombinedTaskId(tasks, inspectionName) {
  const ids = tasks.map((task) => task.id).join("__");
  return `combined_${safeFilePart(inspectionName || "汇总检查")}_${ids || "empty"}`;
}

function renderReportTaskPanel() {
  const panel = document.querySelector("#reportTaskPanel");
  if (!panel) {
    return;
  }

  if (!reportState.tasks.length) {
    panel.className = "empty-state glass";
    panel.innerHTML = "<h3>暂无检查任务</h3><p>请先在“安全检查隐患采集”中录入隐患，或导入检查数据 JSON。</p>";
    return;
  }

  panel.className = "hazard-list";
  panel.innerHTML = reportState.tasks.map((task) => {
    const stats = getRectificationStats(task.id);
    return `
      <article class="hazard-card glass report-task-card report-select-card" data-task-id="${escapeAttr(task.id)}">
        <div class="hazard-card-head">
          <div>
            <label class="report-task-check">
              <input class="report-task-checkbox" type="checkbox" value="${escapeAttr(task.id)}" ${reportState.selectedTaskIds.includes(task.id) ? "checked" : ""}>
              <strong>${escapeHtml(task.name)}</strong>
            </label>
            <span>${escapeHtml(task.date)}｜${escapeHtml(task.location)}</span>
          </div>
          <small>${task.hazards.length} 项隐患</small>
        </div>
        <div class="hazard-meta report-stats">
          <span>完成情况：${stats.completedText}/${stats.total}</span>
          <span>整改后照片：${stats.afterPhotoCount}/${stats.total}</span>
          <span>未反馈：${stats.unfinished}</span>
        </div>
      </article>
    `;
  }).join("");
}

async function handleReportAction(taskId, action) {
  const task = getInspectionTaskById(taskId);
  if (!task) {
    showToast("未找到检查任务");
    return;
  }

  try {
    if (action === "governance") {
      await exportGovernanceTable(task);
    } else if (action === "initial") {
      await exportRectificationReport(task, "initial");
    } else if (action === "rectify") {
      renderRectificationPanel(task);
    } else if (action === "final") {
      await validateAndExportFinalReport(task);
    } else if (action === "export-task") {
      exportInspectionData(taskId);
    } else if (action === "export-feedback") {
      exportRectificationFeedback(taskId);
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || "导出失败，请检查数据");
  }
}

async function handleCombinedReportAction(action) {
  normalizeReportSelection();
  const task = getCombinedReportTask();
  if (!task.hazards.length) {
    showToast("请至少选择一个包含隐患的检查任务");
    return;
  }

  try {
    if (action === "governance") {
      await exportGovernanceTable(task);
    } else if (action === "initial") {
      await exportRectificationReport(task, "initial");
    } else if (action === "rectify") {
      renderRectificationPanel(task);
    } else if (action === "final") {
      await validateAndExportFinalReport(task);
    } else if (action === "export-task") {
      exportCombinedInspectionData(task);
    } else if (action === "export-feedback") {
      exportCombinedRectificationFeedback(task);
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || "导出失败，请检查数据");
  }
}

function createDefaultReportConfig(task = null, previousConfig = null) {
  const dateText = task ? formatChineseDate(task.date) : formatChineseDate(getTodayDate());
  const previousName = previousConfig?.inspectionName;
  const inspectionName = previousName || (task?.sourceTasks ? "安全环保综合检查" : (task ? `${task.location || "现场"}安全检查` : "安全检查"));
  return {
    governanceNo: `ZHJYAF${new Date().getFullYear()}XX`,
    checkedUnit: task?.location || "锦原铀业",
    inspectionDateText: dateText,
    participants: task?.leader || "",
    makerDepartment: "安防环保部",
    makerDate: dateText,
    reportTitle: `关于落实${inspectionName}意见的情况报告`,
    headerCompanyName: "锦原铀业有限公司",
    recipientDepartment: "安防环保部",
    inspectionUnit: task?.leader || "检查组",
    inspectedUnit: task?.location || "锦原铀业",
    inspectionName,
    reportCompany: "锦原铀业有限公司",
    reportDate: dateText,
    handlingMeasure: "限期整改"
  };
}

async function getInspectionTasks() {
  const data = await loadHazardData();
  hazardState.data = data;
  const groups = new Map();

  data.hazards.forEach((hazard) => {
    const info = getHazardInspectionInfo(hazard);
    const id = buildTaskId(info);
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: `${info.date || ""}${info.location || "未填写地点"}检查`,
        date: info.date || "",
        location: info.location || "",
        leader: info.leader || "",
        inspectionInfo: info,
        hazards: []
      });
    }
    groups.get(id).hazards.push(hazard);
  });

  return Array.from(groups.values());
}

function getInspectionTaskById(taskId) {
  return reportState.tasks.find((task) => task.id === taskId) || null;
}

function getHazardsByTaskId(taskId) {
  return getInspectionTaskById(taskId)?.hazards || [];
}

function getHazardBeforePhotos(hazardId) {
  const hazard = hazardState.data.hazards.find((item) => item.id === hazardId);
  return hazard ? hazard.photos : [];
}

function buildTaskId(info) {
  return `${safeFilePart(info.date || "未填写日期")}_${safeFilePart(info.location || "未填写地点")}_${safeFilePart(info.leader || "未填写组长")}`;
}

function getRectificationStats(taskId) {
  const task = typeof taskId === "object" ? taskId : getInspectionTaskById(taskId);
  const hazards = task?.hazards || [];
  const taskFeedback = task ? getTaskFeedback(task) : {};
  const completedText = hazards.filter((hazard) => taskFeedback[hazard.id]?.completionText?.trim()).length;
  const afterPhotoCount = hazards.filter((hazard) => (taskFeedback[hazard.id]?.afterPhotos || []).length).length;
  const finished = hazards.filter((hazard) => {
    const feedback = taskFeedback[hazard.id] || {};
    return feedback.completionText?.trim() && (feedback.afterPhotos || []).length;
  }).length;

  return {
    total: hazards.length,
    completedText,
    afterPhotoCount,
    finished,
    unfinished: hazards.length - finished
  };
}

function getTaskFeedback(task) {
  const feedback = { ...(reportState.feedback[task.id] || {}) };
  (task.hazards || []).forEach((hazard) => {
    if (!feedback[hazard.id]) {
      const sourceTaskId = hazard.reportSourceTaskId || buildTaskId(getHazardInspectionInfo(hazard));
      if (reportState.feedback[sourceTaskId]?.[hazard.id]) {
        feedback[hazard.id] = reportState.feedback[sourceTaskId][hazard.id];
      }
    }
  });
  return feedback;
}

async function getAllRectificationFeedback() {
  try {
    return (await readDbRecord(RECTIFICATION_FEEDBACK_KEY)) || {};
  } catch (error) {
    console.warn("Failed to read rectification feedback", error);
    return {};
  }
}

async function saveAllRectificationFeedback(feedback) {
  reportState.feedback = feedback;
  await writeDbRecord(RECTIFICATION_FEEDBACK_KEY, feedback);
}

async function saveRectificationFeedback(taskId, hazardId, feedback) {
  const allFeedback = await getAllRectificationFeedback();
  allFeedback[taskId] = allFeedback[taskId] || {};
  allFeedback[taskId][hazardId] = {
    taskId,
    hazardId,
    completionText: feedback.completionText || "",
    afterPhotos: feedback.afterPhotos || [],
    completionDate: feedback.completionDate || "",
    feedbackPerson: feedback.feedbackPerson || "",
    remark: feedback.remark || "",
    updatedAt: new Date().toISOString()
  };
  await saveAllRectificationFeedback(allFeedback);
}

function getRectificationFeedback(taskId) {
  return reportState.feedback[taskId] || {};
}

function getHazardFeedback(taskId, hazardId) {
  return getRectificationFeedback(taskId)[hazardId] || {
    taskId,
    hazardId,
    completionText: "",
    afterPhotos: [],
    completionDate: "",
    feedbackPerson: "",
    remark: ""
  };
}

function buildCompletionSentence(input) {
  const text = normalizeChineseSentence(input);

  if (!text) {
    return "已完成整改，已        。";
  }

  if (text.startsWith("已完成整改")) {
    return ensureChinesePeriod(text);
  }

  const cleaned = text.startsWith("已") ? text.slice(1) : text;
  return ensureChinesePeriod(`已完成整改，已${cleaned}`);
}

function normalizeChineseSentence(input) {
  return String(input || "")
    .trim()
    .replace(/[。．.]+$/g, "")
    .replace(/\s+/g, "");
}

function ensureChinesePeriod(text) {
  return `${String(text || "").replace(/[。．.]+$/g, "")}。`;
}

const REPORT_DOC = {
  a4Width: 11906,
  a4Height: 16838,
  margin: 1440,
  line28: 560,
  titleSize: 44,
  bodySize: 32,
  captionSize: 28,
  firstLineIndent: 640
};

function reportRun(d, text, options = {}) {
  return new d.TextRun({
    text: text || "",
    font: options.font || "仿宋",
    size: options.size || REPORT_DOC.bodySize,
    bold: Boolean(options.bold)
  });
}

function reportParagraph(d, children, options = {}) {
  const paragraphChildren = Array.isArray(children)
    ? children
    : [reportRun(d, children, options.run || {})];
  return new d.Paragraph({
    children: paragraphChildren,
    alignment: options.alignment || d.AlignmentType.JUSTIFIED,
    indent: options.firstLine === false ? undefined : { firstLine: REPORT_DOC.firstLineIndent },
    spacing: {
      line: REPORT_DOC.line28,
      lineRule: d.LineRuleType.EXACT,
      before: options.before || 0,
      after: options.after || 0
    },
    heading: options.heading,
    outlineLevel: options.outlineLevel,
    border: options.border
  });
}

function reportTitleParagraph(d, title) {
  return reportParagraph(d, [reportRun(d, title, {
    font: "方正小标宋简体",
    size: REPORT_DOC.titleSize,
    bold: true
  })], {
    alignment: d.AlignmentType.CENTER,
    firstLine: false,
    after: 240
  });
}

function reportRecipientParagraph(d, recipient) {
  return reportParagraph(d, [reportRun(d, `${recipient}：`, {
    font: "仿宋",
    size: REPORT_DOC.bodySize
  })], {
    alignment: d.AlignmentType.LEFT,
    firstLine: false
  });
}

function reportLevelOneParagraph(d, text) {
  return reportParagraph(d, [reportRun(d, text, {
    font: "黑体",
    size: REPORT_DOC.bodySize,
    bold: true
  })]);
}

function reportHazardTitleParagraph(d, text) {
  return reportParagraph(d, [reportRun(d, text, {
    font: "楷体",
    size: REPORT_DOC.bodySize,
    bold: true
  })], {
    heading: d.HeadingLevel.HEADING_2,
    outlineLevel: 2
  });
}

function reportLabeledParagraph(d, label, text) {
  return reportParagraph(d, [
    reportRun(d, label, { font: "仿宋", size: REPORT_DOC.bodySize, bold: true }),
    reportRun(d, text, { font: "仿宋", size: REPORT_DOC.bodySize })
  ], { outlineLevel: 2 });
}

function reportSignatureParagraph(d, text, before = 0) {
  return reportParagraph(d, [reportRun(d, text, {
    font: "仿宋",
    size: REPORT_DOC.bodySize
  })], {
    alignment: d.AlignmentType.RIGHT,
    firstLine: false,
    before
  });
}

function reportLineBorder(d) {
  return {
    color: "000000",
    space: 1,
    style: d.BorderStyle.SINGLE,
    size: 6
  };
}

function buildReportDocument(d, children, options = {}) {
  const headerCompanyName = options.headerCompanyName || "锦原铀业有限公司";
  return new d.Document({
    features: { updateFields: true },
    sections: [{
      properties: {
        page: {
          size: { width: REPORT_DOC.a4Width, height: REPORT_DOC.a4Height },
          margin: {
            top: REPORT_DOC.margin,
            right: REPORT_DOC.margin,
            bottom: REPORT_DOC.margin,
            left: REPORT_DOC.margin
          }
        }
      },
      headers: {
        default: new d.Header({
          children: [
            new d.Paragraph({
              children: [reportRun(d, headerCompanyName, { font: "仿宋", size: 24 })],
              alignment: d.AlignmentType.CENTER,
              border: { bottom: reportLineBorder(d) },
              spacing: { after: 120 }
            })
          ]
        })
      },
      footers: {
        default: new d.Footer({
          children: [
            new d.Paragraph({
              border: { top: reportLineBorder(d) },
              spacing: { after: 80 },
              children: [new d.TextRun("")]
            }),
            new d.Paragraph({
              children: [
                reportRun(d, "第 ", { font: "仿宋", size: 24 }),
                new d.TextRun({ children: [d.PageNumber.CURRENT], font: "仿宋", size: 24 }),
                reportRun(d, " 页", { font: "仿宋", size: 24 })
              ],
              alignment: d.AlignmentType.CENTER
            })
          ]
        })
      },
      children
    }]
  });
}

function renderRectificationPanel(task) {
  const panel = document.querySelector("#rectificationPanel");
  const taskFeedback = getTaskFeedback(task);
  const stats = getRectificationStats(task);

  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div class="section-title">
      <div>
        <h2>整改端</h2>
        <p class="hint">${escapeHtml(task.name)}｜共 ${stats.total} 项，已完成 ${stats.finished} 项，未反馈 ${stats.unfinished} 项。</p>
      </div>
      <button id="closeRectificationPanel" class="button ghost" type="button">关闭</button>
    </div>
    <div class="rectification-summary">
      <span>已填写完成情况：${stats.completedText}</span>
      <span>已上传整改后照片：${stats.afterPhotoCount}</span>
      <span>未完成：${stats.unfinished}</span>
    </div>
    <div class="hazard-list">
      ${task.hazards.map((hazard, index) => renderRectificationCard(task.id, hazard, taskFeedback[hazard.id], index)).join("")}
    </div>
  `;

  document.querySelector("#closeRectificationPanel").addEventListener("click", () => {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  });
  bindRectificationEvents(task);
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRectificationCard(taskId, hazard, feedback = {}, index) {
  const status = getFeedbackStatus(feedback);
  return `
    <article class="hazard-card glass rectification-card" data-task-id="${escapeAttr(taskId)}" data-hazard-id="${escapeAttr(hazard.id)}">
      <div class="hazard-card-head">
        <div>
          <strong>${index + 1}. ${escapeHtml(hazard.code)}</strong>
          <span>${escapeHtml(status)}</span>
        </div>
        <small>${escapeHtml(getHazardInspectionInfo(hazard).location || "")}</small>
      </div>
      <p><b>问题隐患：</b>${escapeHtml(hazard.problem)}</p>
      <p><b>整改措施：</b>${escapeHtml(hazard.measure)}</p>
      <div class="photo-grid">
        ${hazard.photos.slice(0, 3).map((photo) => `
          <figure class="photo-thumb"><img src="${photo.watermarkedDataUrl}" alt="${escapeAttr(photo.fileName)}"><figcaption>整改前</figcaption></figure>
        `).join("")}
      </div>
      <label class="field">
        <span>实际完成情况（只填“已”后面的内容）</span>
        <textarea class="textarea rectification-text" placeholder="例如：重新接通电源，恢复第二安全通道照明">${escapeHtml(feedback.completionText || "")}</textarea>
      </label>
      <label class="field photo-field">
        <span>整改后照片</span>
        <input class="input file-input rectification-photo-input" type="file" accept="image/*" capture="environment" multiple>
      </label>
      <div class="photo-grid after-photo-list">
        ${(feedback.afterPhotos || []).map((photo) => `
          <figure class="photo-thumb" data-after-photo-id="${escapeAttr(photo.id)}">
            <img src="${photo.dataUrl}" alt="${escapeAttr(photo.name)}">
            <figcaption>${escapeHtml(photo.name)}</figcaption>
            <button class="icon-button delete after-photo-delete" type="button">×</button>
          </figure>
        `).join("") || `<div class="photo-empty">暂无整改后照片</div>`}
      </div>
      <div class="actions">
        <button class="button primary save-feedback-button" type="button">保存反馈</button>
      </div>
    </article>
  `;
}

function bindRectificationEvents(task) {
  document.querySelectorAll(".rectification-card").forEach((card) => {
    const hazardId = card.dataset.hazardId;
    card.querySelector(".save-feedback-button").addEventListener("click", () => saveFeedbackFromCard(task.id, hazardId, card));
    card.querySelector(".rectification-photo-input").addEventListener("change", (event) => handleAfterPhotoInput(task.id, hazardId, event, card));
    card.querySelectorAll(".after-photo-delete").forEach((button) => {
      button.addEventListener("click", async () => {
        const photoId = button.closest("[data-after-photo-id]").dataset.afterPhotoId;
        const feedback = getHazardFeedback(task.id, hazardId);
        feedback.afterPhotos = feedback.afterPhotos.filter((photo) => photo.id !== photoId);
        await saveRectificationFeedback(task.id, hazardId, feedback);
        reportState.feedback = await getAllRectificationFeedback();
        renderRectificationPanel(task);
        renderReportTaskPanel();
      });
    });
  });
}

async function saveFeedbackFromCard(taskId, hazardId, card) {
  const oldFeedback = getHazardFeedback(taskId, hazardId);
  await saveRectificationFeedback(taskId, hazardId, {
    ...oldFeedback,
    completionText: card.querySelector(".rectification-text").value.trim()
  });
  reportState.feedback = await getAllRectificationFeedback();
  showToast("整改反馈已保存");
  renderReportTaskPanel();
}

async function handleAfterPhotoInput(taskId, hazardId, event, card) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) {
    return;
  }

  const feedback = getHazardFeedback(taskId, hazardId);
  showToast("正在压缩整改后照片...");
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }
    const dataUrl = await createCompressedPhoto(file, 1200, 0.8);
    feedback.afterPhotos.push({
      id: createId(),
      name: `${hazardId}_after_${feedback.afterPhotos.length + 1}.jpg`,
      dataUrl,
      mimeType: "image/jpeg"
    });
  }
  feedback.completionText = card.querySelector(".rectification-text").value.trim();
  await saveRectificationFeedback(taskId, hazardId, feedback);
  reportState.feedback = await getAllRectificationFeedback();
  renderRectificationPanel(getInspectionTaskById(taskId));
  renderReportTaskPanel();
  showToast("整改后照片已保存");
}

function getFeedbackStatus(feedback = {}) {
  const hasText = Boolean(feedback.completionText?.trim());
  const hasPhotos = Boolean((feedback.afterPhotos || []).length);
  if (hasText && hasPhotos) return "已完成";
  if (hasText) return "已填写完成情况";
  if (hasPhotos) return "已上传整改后照片";
  return "未反馈";
}

async function exportGovernanceTable(task) {
  if (!task.hazards.length) {
    throw new Error("隐患数据为空，无法生成治理表");
  }
  if (!window.ExcelJS) {
    throw new Error("Excel 组件未加载，请刷新页面后重试");
  }

  showToast("正在生成隐患治理表...");
  const workbook = new ExcelJS.Workbook();
  let worksheet;
  const templateLoaded = await loadGovernanceTemplate(workbook);
  worksheet = workbook.worksheets[0] || workbook.addWorksheet("隐患治理表");

  if (!templateLoaded) {
    buildFallbackGovernanceSheet(worksheet);
  }
  fillGovernanceSheet(worksheet, task);

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(`${formatChineseDate(task.date)}${task.location || ""}检查隐患治理表.xlsx`, new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }));
  showToast(templateLoaded ? "治理表导出成功" : "未找到模板，已导出兜底治理表");
}

async function loadGovernanceTemplate(workbook) {
  try {
    const response = await fetch("templates/01-隐患排查整治台账.xlsx");
    if (!response.ok) {
      return false;
    }
    await workbook.xlsx.load(await response.arrayBuffer());
    return true;
  } catch (error) {
    return false;
  }
}

function buildFallbackGovernanceSheet(worksheet) {
  worksheet.columns = [
    { key: "seq", width: 8 },
    { key: "problem", width: 34 },
    { key: "level", width: 12 },
    { key: "measure", width: 34 },
    { key: "leader", width: 14 },
    { key: "unit", width: 18 },
    { key: "person", width: 14 },
    { key: "time", width: 14 },
    { key: "acceptor", width: 16 },
    { key: "handling", width: 28 },
    { key: "k", width: 8 },
    { key: "l", width: 8 }
  ];
  worksheet.mergeCells("A1:L1");
  worksheet.getCell("A1").value = "隐患排查整治台账";
  worksheet.getCell("A1").font = { bold: true, size: 18 };
  worksheet.getCell("A1").alignment = { horizontal: "center" };
  worksheet.addRow([]);
  worksheet.addRow(["序号", "隐患名称", "隐患等级", "拟采取的治理措施", "督办领导", "治理责任单位或部门", "治理责任人", "治理时间", "整治完成验收人", "处理措施", "", ""]);
  worksheet.mergeCells("J3:L3");
}

function fillGovernanceSheet(worksheet, task) {
  const config = reportState.config;
  worksheet.getCell("A1").value = `${config.checkedUnit || task.location || ""}检查隐患治理表`;
  const headerRow = findGovernanceHeaderRow(worksheet);
  const startRow = headerRow + 1;
  task.hazards.forEach((hazard, index) => {
    const rowNumber = startRow + index;
    const row = worksheet.getRow(rowNumber);
      row.values = [
      index + 1,
      formatHazardProblemForOutput(task, hazard),
      hazard.level || "一般",
      hazard.measure,
      hazard.supervisingLeader || "",
      hazard.responsibleUnit || "",
      hazard.responsiblePerson || "",
      hazard.deadline || "",
      "",
      config.handlingMeasure || "限期整改",
      "",
      ""
    ];
    try {
      worksheet.unMergeCells(`J${rowNumber}:L${rowNumber}`);
    } catch (error) {
      // ignore non-merged row
    }
    worksheet.mergeCells(`J${rowNumber}:L${rowNumber}`);
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
    row.height = Math.max(32, Math.ceil(formatHazardProblemForOutput(task, hazard).length / 18) * 18);
  });
}

function formatHazardProblemForOutput(task, hazard) {
  const location = getHazardInspectionInfo(hazard).location;
  if (task?.sourceTasks?.length > 1 && location) {
    return `【${location}】${hazard.problem || ""}`;
  }
  return hazard.problem || "";
}

function findGovernanceHeaderRow(worksheet) {
  for (let rowNumber = 1; rowNumber <= Math.min(30, worksheet.rowCount || 30); rowNumber += 1) {
    const values = worksheet.getRow(rowNumber).values.join("");
    if (values.includes("隐患名称") || values.includes("拟采取")) {
      return rowNumber;
    }
  }
  return 3;
}

async function validateAndExportFinalReport(task) {
  const feedback = getTaskFeedback(task);
  const missingText = task.hazards.filter((hazard) => !feedback[hazard.id]?.completionText?.trim()).length;
  const missingAfterPhotos = task.hazards.filter((hazard) => !(feedback[hazard.id]?.afterPhotos || []).length).length;
  const missingMeasures = task.hazards.filter((hazard) => !hazard.measure?.trim()).length;
  const missingBeforePhotos = task.hazards.filter((hazard) => !(hazard.photos || []).length).length;
  const warnings = [
    missingText ? `还有 ${missingText} 项隐患未填写完成情况。` : "",
    missingAfterPhotos ? `还有 ${missingAfterPhotos} 项隐患未上传整改后照片。` : "",
    missingMeasures ? `还有 ${missingMeasures} 项隐患没有整改措施。` : "",
    missingBeforePhotos ? `还有 ${missingBeforePhotos} 项隐患没有整改前照片。` : ""
  ].filter(Boolean);

  if (warnings.length && !window.confirm(`${warnings.join("\n")}\n是否继续生成最终整改报告？`)) {
    return;
  }
  await exportRectificationReport(task, "final");
}

async function exportRectificationReport(task, type) {
  if (!window.docx) {
    throw new Error("Word 组件未加载，请刷新页面后重试");
  }
  if (!task.hazards.length) {
    throw new Error("隐患数据为空，无法生成整改报告");
  }

  showToast("正在生成整改报告...");
  const d = window.docx;
  const feedback = getTaskFeedback(task);
  const paragraphs = [];
  const title = type === "initial"
    ? `关于落实${reportState.config.inspectionName}意见的情况报告-初版`
    : `关于落实${reportState.config.inspectionName}意见的情况报告-最终版`;

  paragraphs.push(reportTitleParagraph(d, title.replace("-初版", "").replace("-最终版", "")));
  paragraphs.push(reportRecipientParagraph(d, reportState.config.recipientDepartment || "安防环保部"));
  paragraphs.push(reportParagraph(d, `${formatChineseDate(task.date)}，${reportState.config.inspectionUnit || "检查组"}对${reportState.config.inspectedUnit || "锦原铀业"}开展了${reportState.config.inspectionName || "安全检查"}，共发现${task.hazards.length}项问题隐患。锦原铀业组织研究制定问题整改措施，下发隐患整改治理表，明确了整改责任人和整改措施，要求限期完成整改。经检查确认，已全部完成整改，现将整改完成情况上报如下：`));
  paragraphs.push(reportLevelOneParagraph(d, "一、问题隐患及整治情况"));

  for (let index = 0; index < task.hazards.length; index += 1) {
    const hazard = task.hazards[index];
    const itemFeedback = feedback[hazard.id] || {};
    const completion = type === "initial"
      ? "已完成整改，已按要求落实整改措施。"
      : buildCompletionSentence(itemFeedback.completionText);
    paragraphs.push(reportHazardTitleParagraph(d, `${index + 1}. ${ensureChinesePeriod(formatHazardProblemForOutput(task, hazard))}`));
    paragraphs.push(reportLabeledParagraph(d, "整改措施：", ensureChinesePeriod(hazard.measure || "")));
    paragraphs.push(reportLabeledParagraph(d, "完成情况：", completion));
    paragraphs.push(await buildPhotoTable(hazard.photos || [], type === "initial" ? [] : (itemFeedback.afterPhotos || [])));
    paragraphs.push(reportParagraph(d, "", { firstLine: false, after: 120 }));
  }

  paragraphs.push(reportSignatureParagraph(d, reportState.config.reportCompany || "锦原铀业有限公司", 360));
  paragraphs.push(reportSignatureParagraph(d, reportState.config.reportDate || formatChineseDate(getTodayDate())));

  const doc = buildReportDocument(d, paragraphs, {
    headerCompanyName: reportState.config.headerCompanyName || reportState.config.reportCompany || "锦原铀业有限公司"
  });
  const blob = await d.Packer.toBlob(doc);
  downloadBlob(`${title}.docx`, blob);
  showToast("整改报告导出成功");
}

async function buildPhotoTable(beforePhotos, afterPhotos) {
  const d = window.docx;
  const rowCount = Math.max(beforePhotos.length, afterPhotos.length, 1);
  const rows = [];

  for (let index = 0; index < rowCount; index += 1) {
    rows.push(new d.TableRow({
      cantSplit: true,
      height: { value: 2850, rule: d.HeightRule.ATLEAST },
      children: [
        buildPhotoCell(d, await buildPhotoParagraph(beforePhotos[index]?.watermarkedDataUrl || beforePhotos[index]?.dataUrl)),
        buildPhotoCell(d, await buildPhotoParagraph(afterPhotos[index]?.watermarkedDataUrl || afterPhotos[index]?.dataUrl))
      ]
    }));
  }

  rows.push(new d.TableRow({
    children: [
      buildPhotoCell(d, reportParagraph(d, [reportRun(d, "整改前", { font: "仿宋", size: REPORT_DOC.captionSize })], {
        alignment: d.AlignmentType.CENTER,
        firstLine: false
      })),
      buildPhotoCell(d, reportParagraph(d, [reportRun(d, "整改后", { font: "仿宋", size: REPORT_DOC.captionSize })], {
        alignment: d.AlignmentType.CENTER,
        firstLine: false
      }))
    ]
  }));

  return new d.Table({
    width: { size: 100, type: d.WidthType.PERCENTAGE },
    layout: d.TableLayoutType.FIXED,
    alignment: d.AlignmentType.CENTER,
    borders: buildReportTableBorders(d),
    rows
  });
}

function buildReportTableBorders(d) {
  const border = { style: d.BorderStyle.SINGLE, size: 4, color: "808080" };
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border
  };
}

function buildPhotoCell(d, paragraph) {
  return new d.TableCell({
    width: { size: 50, type: d.WidthType.PERCENTAGE },
    verticalAlign: d.VerticalAlign.CENTER,
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [paragraph]
  });
}

async function buildPhotoParagraph(dataUrl) {
  const d = window.docx;
  if (!dataUrl) {
    return reportParagraph(d, [reportRun(d, "暂无照片", { font: "仿宋", size: REPORT_DOC.captionSize })], {
      alignment: d.AlignmentType.CENTER,
      firstLine: false
    });
  }
  const imageSize = await getImageDisplaySize(dataUrl, 250, 175);
  return new d.Paragraph({
    alignment: d.AlignmentType.CENTER,
    children: [
      new d.ImageRun({
        type: getDocxImageType(dataUrl),
        data: dataUrlToUint8Array(dataUrl),
        transformation: imageSize
      })
    ]
  });
}

function getDocxImageType(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/(png|gif|bmp|jpe?g);/i);
  if (!match) return "jpg";
  const type = match[1].toLowerCase();
  return type === "jpeg" ? "jpg" : type;
}

function getImageDisplaySize(dataUrl, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const fallback = { width: maxWidth, height: Math.round(maxWidth * 0.68) };
    if (typeof Image === "undefined") {
      resolve(fallback);
      return;
    }
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width || maxWidth;
      const height = image.naturalHeight || image.height || maxHeight;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      resolve({
        width: Math.max(1, Math.round(width * ratio)),
        height: Math.max(1, Math.round(height * ratio))
      });
    };
    image.onerror = () => resolve(fallback);
    image.src = dataUrl;
  });
}

function exportInspectionData(taskId) {
  const task = getInspectionTaskById(taskId);
  if (!task) {
    showToast("未找到检查任务");
    return;
  }
  const data = {
    inspectionInfo: task.inspectionInfo,
    hazards: task.hazards
  };
  downloadTextFile(`${formatChineseDate(task.date)}${task.location || ""}检查数据.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  showToast("检查数据已导出");
}

function exportCombinedInspectionData(task) {
  const data = {
    inspectionInfo: {
      date: task.date,
      location: task.location,
      leader: task.leader,
      inspectionName: reportState.config.inspectionName
    },
    sourceTasks: task.sourceTasks.map((item) => ({
      id: item.id,
      name: item.name,
      date: item.date,
      location: item.location,
      leader: item.leader,
      hazardCount: item.hazards.length
    })),
    hazards: task.hazards.map(cloneHazard)
  };
  downloadTextFile(`${formatChineseDate(task.date)}${reportState.config.inspectionName || "汇总检查"}检查数据.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  showToast("所选检查数据已导出");
}

async function importInspectionData(jsonData) {
  if (!isValidHazardData(jsonData)) {
    throw new Error("检查数据格式不正确");
  }
  const incoming = normalizeHazardData(jsonData);
  const current = await loadHazardData();
  const incomingTaskId = buildTaskId(incoming.inspectionInfo);
  const exists = current.hazards.some((hazard) => buildTaskId(getHazardInspectionInfo(hazard)) === incomingTaskId);
  let hazards = current.hazards;

  if (exists) {
    const shouldOverwrite = window.confirm("该检查任务已存在。\n\n确定：覆盖该任务\n取消：合并追加隐患");
    hazards = shouldOverwrite
      ? current.hazards.filter((hazard) => buildTaskId(getHazardInspectionInfo(hazard)) !== incomingTaskId)
      : current.hazards;
  }

  hazardState.data = {
    inspectionInfo: current.inspectionInfo.location ? current.inspectionInfo : incoming.inspectionInfo,
    hazards: [...hazards, ...incoming.hazards.map(cloneHazard)]
  };
  await saveHazardData();
}

async function importInspectionDataFiles(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) return;

  try {
    for (const file of files) {
      await importInspectionData(await readJsonFile(file));
    }
    showToast("检查数据导入成功");
    await renderReportCenter();
  } catch (error) {
    showToast(error.message || "检查数据导入失败");
  }
}

function exportRectificationFeedback(taskId) {
  const task = getInspectionTaskById(taskId);
  const feedback = getRectificationFeedback(taskId);
  downloadTextFile(`${formatChineseDate(task?.date || getTodayDate())}${task?.location || ""}检查整改反馈数据.json`, JSON.stringify({
    taskId,
    feedback
  }, null, 2), "application/json;charset=utf-8");
  showToast("整改反馈已导出");
}

function exportCombinedRectificationFeedback(task) {
  downloadTextFile(`${formatChineseDate(task.date)}${reportState.config.inspectionName || "汇总检查"}整改反馈数据.json`, JSON.stringify({
    taskId: task.id,
    sourceTaskIds: task.sourceTasks.map((item) => item.id),
    feedback: getTaskFeedback(task)
  }, null, 2), "application/json;charset=utf-8");
  showToast("整改反馈已导出");
}

async function importRectificationFeedback(jsonData) {
  if (!jsonData || typeof jsonData !== "object" || !jsonData.taskId || !jsonData.feedback) {
    throw new Error("整改反馈数据格式不正确");
  }
  const allFeedback = await getAllRectificationFeedback();
  allFeedback[jsonData.taskId] = {
    ...(allFeedback[jsonData.taskId] || {}),
    ...jsonData.feedback
  };
  await saveAllRectificationFeedback(allFeedback);
}

async function importFeedbackDataFiles(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) return;

  try {
    for (const file of files) {
      await importRectificationFeedback(await readJsonFile(file));
    }
    showToast("整改反馈导入成功");
    await renderReportCenter();
  } catch (error) {
    showToast(error.message || "整改反馈导入失败");
  }
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(new Error("JSON 文件格式错误"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file, "utf-8");
  });
}

async function renderHazardGovernanceModule() {
  app.innerHTML = `<section class="tool-card glass"><h2>隐患排查治理</h2><p class="hint">正在读取治理台账...</p></section>`;
  governanceState.data = await loadGovernanceData();

  app.innerHTML = `
    <div class="tool-layout governance-module">
      <section class="tool-card glass governance-hero">
        <div class="section-title">
          <div>
            <span class="eyebrow">离线治理台账</span>
            <h2>隐患排查治理模块</h2>
            <p class="hint">按“确定检查任务 - 下发通知 - 检查采集 - 确认责任 - 下发整改 - 汇总反馈 - 报告闭环”的实际流程组织。</p>
          </div>
          <button id="syncCaptureButton" class="button" type="button">同步采集数据</button>
        </div>
        ${renderGovernanceWorkflowBar()}
        <div class="governance-tabs" role="tablist">
          ${[
            ["dashboard", "工作总览"],
            ["ledger", "隐患总台账"],
            ["inspection", "检查任务"],
            ["hazardEntry", "检查采集"],
            ["reports", "治理表/报告"],
            ["tasks", "任务下发"],
            ["feedback", "反馈导入"],
            ["rectification", "整改汇总"],
            ["scripts", "任务话术生成"],
            ["settings", "基础设置"],
            ["backup", "备份恢复"]
          ].map(([key, label]) => `
            <button class="governance-tab ${governanceState.activeTab === key ? "active" : ""}" type="button" data-tab="${key}">${label}</button>
          `).join("")}
        </div>
      </section>
      <section id="governanceContent"></section>
    </div>
  `;

  document.querySelector("#syncCaptureButton").addEventListener("click", syncCaptureDataToGovernance);
  document.querySelectorAll("[data-workflow-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      governanceState.activeTab = button.dataset.workflowTab;
      governanceState.workflowFocus = button.dataset.workflowKey || "";
      renderHazardGovernanceModule();
    });
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      governanceState.activeTab = button.dataset.tab;
      governanceState.workflowFocus = "";
      renderHazardGovernanceModule();
    });
  });
  renderGovernanceActiveTab();
}

function renderGovernanceWorkflowBar() {
  const steps = [
    ["inspection", "inspection", "1", "确定检查任务", "登记检查、通知文件、检查意见"],
    ["hazardEntry", "capture", "2", "分组检查采集", "录入或导入检查发现的问题隐患"],
    ["ledger", "ledger", "3", "隐患总台账", "查看、筛选和核对全部隐患"],
    ["reports", "materials", "4", "责任确认与初版材料", "分配责任并生成治理表、初版报告"],
    ["tasks", "dispatch", "5", "下发整改任务", "按责任部门导出 JSON 或生成话术"],
    ["feedback", "feedback", "6", "汇总整改反馈", "导入反馈并更新台账状态"],
    ["rectification", "rectify", "7", "核对整改状态", "维护整改、延期和闭环状态"],
    ["reports", "closeout", "8", "生成闭环报告", "终版、含延期版和补充报告"]
  ];
  const fallbackKey = {
    inspection: "inspection",
    hazardEntry: "capture",
    ledger: "ledger",
    reports: "materials",
    tasks: "dispatch",
    feedback: "feedback",
    rectification: "rectify"
  }[governanceState.activeTab] || "";
  const activeKey = governanceState.workflowFocus || fallbackKey;
  return `
    <div class="workflow-strip" aria-label="隐患治理流程">
      ${steps.map(([tab, key, number, title, desc]) => `
        <button class="workflow-step ${activeKey === key ? "active" : ""}" type="button" data-workflow-tab="${tab}" data-workflow-key="${key}">
          <span>${number}</span>
          <strong>${title}</strong>
          <small>${desc}</small>
        </button>
      `).join("")}
    </div>
  `;
}

async function loadGovernanceData() {
  const stored = await readDbRecord(GOVERNANCE_RECORD_KEY).catch(() => null);
  if (stored && stored.schemaVersion === "hazard-governance-v1") {
    return normalizeGovernanceData(stored);
  }

  const data = createEmptyGovernanceData();
  const captureData = await loadHazardData().catch(() => createEmptyHazardData());
  if (captureData.hazards.length) {
    importCaptureDataIntoGovernanceData(data, captureData);
    await writeDbRecord(GOVERNANCE_RECORD_KEY, data).catch(() => {});
  }
  return data;
}

async function saveGovernanceData() {
  recalculateGovernanceData();
  await writeDbRecord(GOVERNANCE_RECORD_KEY, governanceState.data);
}

function createEmptyGovernanceData() {
  return {
    schemaVersion: "hazard-governance-v1",
    settings: createDefaultGovernanceSettings(),
    inspections: [],
    hazards: [],
    updatedAt: new Date().toISOString()
  };
}

function createDefaultGovernanceSettings() {
  return {
    checkTypes: [
      { name: "公司检查", code: "NB" },
      { name: "系统上级检查", code: "SJ" },
      { name: "外部检查", code: "WB" }
    ],
    hazardLevels: ["一般隐患", "重大隐患"],
    hazardTypes: {
      "安全管理": ["制度台账", "教育培训", "现场管理"],
      "设备设施": ["机械设备", "电气安全", "特种设备"],
      "作业环境": ["井下作业", "高处作业", "受限空间"],
      "消防环保": ["消防安全", "环保设施", "危化品管理"]
    },
    responsibleDepts: ["矿山", "水冶厂", "安防环保部", "机动能源部"],
    supervisionLeaders: ["分管负责人"],
    acceptors: ["安防环保部"],
    statuses: ["整改中", "已整改", "延期整改"],
    platformCloseStatuses: ["未上传", "已上传闭环"],
    reportCompanies: ["锦原铀业有限公司"]
  };
}

function normalizeGovernanceData(data) {
  const defaults = createEmptyGovernanceData();
  const settings = { ...defaults.settings, ...(data.settings || {}) };
  return {
    schemaVersion: "hazard-governance-v1",
    settings,
    inspections: Array.isArray(data.inspections) ? data.inspections.map(normalizeGovernanceInspection) : [],
    hazards: Array.isArray(data.hazards) ? data.hazards.map(normalizeGovernanceHazard) : [],
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function normalizeGovernanceInspection(item) {
  const typeCode = item.checkTypeCode || checkTypeCodeFromName(item.checkType) || "NB";
  const typeName = item.checkType || checkTypeNameFromCode(typeCode);
  const inspection = {
    id: item.id || createId(),
    checkNo: item.checkNo || "",
    checkType: typeName,
    checkTypeCode: typeCode,
    checkName: item.checkName || "",
    checkDate: item.checkDate || getTodayDate(),
    checkPlace: item.checkPlace || "",
    leadDept: item.leadDept || "",
    isSelfResponsible: Boolean(item.isSelfResponsible),
    groupLeader: item.groupLeader || "",
    noticeFileName: item.noticeFileName || "",
    opinionFileName: item.opinionFileName || "",
    hazardCount: Number(item.hazardCount || 0),
    folderName: item.folderName || "",
    remark: item.remark || "",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
  inspection.folderName = buildInspectionFolderName(inspection);
  return inspection;
}

function normalizeGovernanceHazard(item) {
  const hazard = {
    id: item.id || createId(),
    checkNo: item.checkNo || "",
    hazardNo: item.hazardNo || "",
    checkType: item.checkType || checkTypeNameFromCode(item.checkTypeCode || "NB"),
    checkDate: item.checkDate || getTodayDate(),
    checkPlace: item.checkPlace || "",
    hazardLevel: item.hazardLevel || "一般隐患",
    hazardType: item.hazardType || "",
    professionalType: item.professionalType || "",
    problem: item.problem || "",
    rectificationMeasures: item.rectificationMeasures || item.measure || "",
    supervisionLeader: item.supervisionLeader || item.supervisingLeader || "",
    responsibleDept: item.responsibleDept || item.responsibleUnit || "",
    responsiblePerson: item.responsiblePerson || "",
    deadline: item.deadline || "",
    acceptor: item.acceptor || "",
    handlingMeasures: item.handlingMeasures || item.completionText || "",
    currentStatus: item.currentStatus || "整改中",
    autoStatus: item.autoStatus || "整改中",
    platformCloseStatus: item.platformCloseStatus || "未上传",
    extensionReason: item.extensionReason || "",
    extensionDeadline: item.extensionDeadline || "",
    beforePhotos: normalizeGovernancePhotos(item.beforePhotos || item.photos || []),
    afterPhotos: normalizeGovernancePhotos(item.afterPhotos || []),
    beforePhotoMain: item.beforePhotoMain || "",
    afterPhotoMain: item.afterPhotoMain || "",
    feedbackSource: item.feedbackSource || "电脑端录入",
    createdAt: item.createdAt || item.createTime || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
  hazard.autoStatus = computeGovernanceAutoStatus(hazard);
  return hazard;
}

function normalizeGovernancePhotos(photos) {
  return Array.isArray(photos) ? photos.map((photo, index) => ({
    id: photo.id || createId(),
    name: photo.name || photo.fileName || `photo-${index + 1}.jpg`,
    dataUrl: photo.dataUrl || photo.watermarkedDataUrl || photo.originalDataUrl || "",
    watermarkedDataUrl: photo.watermarkedDataUrl || photo.dataUrl || "",
    mimeType: photo.mimeType || "image/jpeg"
  })) : [];
}

function renderGovernanceActiveTab() {
  const content = document.querySelector("#governanceContent");
  if (!content) return;
  const renderers = {
    dashboard: renderGovernanceDashboard,
    inspection: renderGovernanceInspectionPage,
    hazardEntry: renderGovernanceHazardEntryPage,
    rectification: renderGovernanceRectificationPage,
    ledger: renderGovernanceLedgerPage,
    tasks: renderGovernanceTaskExportPage,
    feedback: renderGovernanceFeedbackImportPage,
    reports: renderGovernanceReportPage,
    scripts: renderGovernanceScriptsPage,
    settings: renderGovernanceSettingsPage,
    backup: renderGovernanceBackupPage
  };
  renderers[governanceState.activeTab]?.(content);
}

function recalculateGovernanceData() {
  governanceState.data.hazards = governanceState.data.hazards.map((hazard) => ({
    ...hazard,
    autoStatus: computeGovernanceAutoStatus(hazard)
  }));
  governanceState.data.inspections = governanceState.data.inspections.map((inspection) => {
    const hazardCount = governanceState.data.hazards.filter((hazard) => hazard.checkNo === inspection.checkNo).length;
    const updated = { ...inspection, hazardCount, updatedAt: new Date().toISOString() };
    updated.folderName = buildInspectionFolderName(updated);
    return updated;
  });
  governanceState.data.updatedAt = new Date().toISOString();
}

function renderGovernanceDashboard(content) {
  recalculateGovernanceData();
  const hazards = governanceState.data.hazards;
  const stats = getGovernanceStats(hazards);
  content.innerHTML = `
    ${renderGovernanceProcessOverview(stats)}
    <div class="governance-grid">
      ${renderGovernanceMetric("全年隐患总数", stats.total, "all")}
      ${renderGovernanceMetric("已整改数量", stats.done, "done")}
      ${renderGovernanceMetric("未整改数量", stats.unfinished, "unfinished")}
      ${renderGovernanceMetric("已逾期数量", stats.overdue, "overdue")}
      ${renderGovernanceMetric("3天内到期", stats.due3, "due3")}
      ${renderGovernanceMetric("7天内到期", stats.due7, "due7")}
      ${renderGovernanceMetric("平台未上传闭环", stats.notClosed, "notClosed")}
      ${renderGovernanceMetric("检查任务数", governanceState.data.inspections.length, "inspection")}
    </div>
    <div class="governance-two-col">
      <section class="tool-card glass">
        <h3>责任部门未完成隐患</h3>
        ${renderGovernanceGroupList(groupHazardsBy(hazards.filter((item) => item.autoStatus !== "已整改"), "responsibleDept"), "暂无未完成隐患")}
      </section>
      <section class="tool-card glass">
        <h3>检查类型未闭环隐患</h3>
        ${renderGovernanceGroupList(groupHazardsBy(hazards.filter((item) => item.platformCloseStatus !== "已上传闭环"), "checkType"), "暂无未闭环隐患")}
      </section>
    </div>
  `;
  content.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      governanceState.activeTab = button.dataset.dashboardTab;
      governanceState.workflowFocus = button.dataset.dashboardWorkflow || "";
      renderHazardGovernanceModule();
    });
  });
  content.querySelectorAll("[data-metric]").forEach((button) => {
    button.addEventListener("click", () => openGovernanceLedgerByMetric(button.dataset.metric));
  });
}

function renderGovernanceProcessOverview(stats) {
  const delayCount = governanceState.data.hazards.filter((item) => item.currentStatus === "延期整改").length;
  const delayClosedCount = governanceState.data.hazards.filter(isGovernanceDelayedCompletedHazard).length;
  const selected = getSelectedGovernanceInspection();
  const stages = [
    {
      tab: "inspection",
      workflow: "inspection",
      title: "1. 检查任务与通知",
      text: "确定检查事项、编号、地点和通知/意见文件，作为后续台账和报告的统一来源。",
      meta: `${governanceState.data.inspections.length} 项检查任务`,
      action: "进入检查任务"
    },
    {
      tab: "hazardEntry",
      workflow: "capture",
      title: "2. 分组采集问题",
      text: "手机端或电脑端录入隐患，也可以导入分组检查形成的隐患治理表。",
      meta: `${stats.total} 条隐患`,
      action: "录入/导入隐患"
    },
    {
      tab: "ledger",
      workflow: "ledger",
      title: "3. 隐患总台账",
      text: "集中查看全部隐患，按检查类型、责任部门、状态和到期时间筛选核对。",
      meta: selected ? `当前：${selected.checkNo}` : "请先选择检查",
      action: "查看总台账"
    },
    {
      tab: "reports",
      workflow: "materials",
      title: "4. 责任分配与初版材料",
      text: "批量或逐条分配督办领导、责任部门、责任人和整改时限，再生成治理表与初版报告。",
      meta: `${stats.unfinished} 项待整改`,
      action: "分配并生成材料"
    },
    {
      tab: "feedback",
      workflow: "feedback",
      title: "5. 汇总反馈并闭环",
      text: "导入责任部门整改反馈，核对延期项和已整改项，再生成终版或补充报告。",
      meta: `${stats.done} 项已整改，${delayCount} 项延期，${delayClosedCount} 项延期已完成`,
      action: "汇总反馈"
    }
  ];

  return `
    <section class="tool-card glass workflow-overview">
      <div class="section-title">
        <div>
          <h2>工作流程总览</h2>
          <p class="hint">按你实际的管理动作组织：先定任务，再采集确认，随后下发整改，最后汇总闭环。</p>
        </div>
      </div>
      <div class="workflow-overview-grid">
        ${stages.map((stage) => `
          <article class="workflow-overview-card">
            <span>${escapeHtml(stage.meta)}</span>
            <h3>${escapeHtml(stage.title)}</h3>
            <p>${escapeHtml(stage.text)}</p>
            <button class="button" type="button" data-dashboard-tab="${stage.tab}" data-dashboard-workflow="${stage.workflow}">${escapeHtml(stage.action)}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGovernanceMetric(label, value, metric) {
  return `
    <button class="metric-card glass" type="button" data-metric="${metric}">
      <span>${label}</span>
      <strong>${value}</strong>
    </button>
  `;
}

function renderGovernanceGroupList(groups, emptyText) {
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return `<p class="hint">${emptyText}</p>`;
  return `<div class="mini-list">${entries.map(([name, count]) => `<span><b>${escapeHtml(name || "未填写")}</b>${count} 项</span>`).join("")}</div>`;
}

function renderGovernanceInspectionPage(content) {
  const editing = governanceState.data.inspections.find((item) => item.id === governanceState.editingInspectionId);
  const selected = getSelectedGovernanceInspection();
  content.innerHTML = `
    <section class="tool-card glass">
      <details class="governance-collapse" ${editing ? "open" : ""}>
        <summary>
          <div>
            <h2>检查任务与通知</h2>
            <p class="hint">先确定检查任务、检查编号、通知文件和检查意见文件。需要录入时展开。</p>
          </div>
          <span class="code-badge">${editing?.checkNo || previewNextGovernanceCheckNo()}</span>
        </summary>
        <form id="governanceInspectionForm" class="form-grid compact-form">
          <label class="field"><span>检查类型</span><select id="govCheckTypeCode" class="select">${governanceState.data.settings.checkTypes.map((type) => `<option value="${type.code}" ${(editing?.checkTypeCode || "NB") === type.code ? "selected" : ""}>${type.name}</option>`).join("")}</select></label>
          <label class="field"><span>检查编号</span><input id="govCheckNo" class="input" value="${escapeAttr(editing?.checkNo || previewNextGovernanceCheckNo())}" data-generated="${escapeAttr(editing?.checkNo || previewNextGovernanceCheckNo())}" placeholder="例如：ZHJYAF2026-NB-01"></label>
          <label class="field"><span>检查名称</span><input id="govCheckName" class="input" value="${escapeAttr(editing?.checkName || "")}" placeholder="例如：2026年1月安全环保综合检查"></label>
          <label class="field"><span>检查日期</span><input id="govCheckDate" class="input" type="date" value="${escapeAttr(editing?.checkDate || getTodayDate())}"></label>
          <label class="field"><span>检查地点</span><input id="govCheckPlace" class="input" value="${escapeAttr(editing?.checkPlace || "")}" placeholder="例如：矿山、水冶厂、机关"></label>
          <label class="field"><span>牵头部门</span><input id="govLeadDept" class="input" value="${escapeAttr(editing?.leadDept || "")}"></label>
          <label class="field"><span>检查组组长</span><input id="govGroupLeader" class="input" value="${escapeAttr(editing?.groupLeader || "")}"></label>
          <label class="field"><span>通知文件名称</span><input id="govNoticeFileName" class="input" value="${escapeAttr(editing?.noticeFileName || "")}"></label>
          <label class="field"><span>检查意见文件名称</span><input id="govOpinionFileName" class="input" value="${escapeAttr(editing?.opinionFileName || "")}"></label>
          <label class="field span-2"><span>备注</span><textarea id="govRemark" class="textarea small-textarea">${escapeHtml(editing?.remark || "")}</textarea></label>
          <label class="checkline"><input id="govIsSelfResponsible" type="checkbox" ${editing?.isSelfResponsible ? "checked" : ""}> 是否本人负责</label>
          <div class="actions span-2">
            <button class="button primary" type="submit">${editing ? "更新检查" : "新建检查"}</button>
            ${editing ? `<button id="cancelGovInspectionEdit" class="button" type="button">取消编辑</button>` : ""}
          </div>
        </form>
      </details>
    </section>
    <section class="tool-card glass">
      <div class="section-title"><h2>已登记检查任务</h2><p class="hint">${selected ? `当前选择：${escapeHtml(selected.checkNo)}` : "选择一项检查后进入检查采集、隐患确认和报告生成。"}</p></div>
      ${renderGovernanceInspectionColumns()}
    </section>
  `;
  content.querySelector("#governanceInspectionForm").addEventListener("submit", saveGovernanceInspectionFromForm);
  content.querySelector("#govCheckTypeCode").addEventListener("change", (event) => {
    if (!governanceState.editingInspectionId) {
      syncGeneratedGovernanceCheckNo(event.target.value, content.querySelector("#govCheckDate").value);
    }
  });
  content.querySelector("#govCheckDate").addEventListener("change", (event) => {
    if (!governanceState.editingInspectionId) {
      syncGeneratedGovernanceCheckNo(content.querySelector("#govCheckTypeCode").value, event.target.value);
    }
  });
  content.querySelector("#govCheckNo").addEventListener("input", (event) => {
    content.querySelector(".code-badge").textContent = event.target.value.trim() || "未填写编号";
  });
  content.querySelector("#cancelGovInspectionEdit")?.addEventListener("click", () => {
    governanceState.editingInspectionId = "";
    renderGovernanceActiveTab();
  });
  bindGovernanceInspectionCardActions(content);
}

function renderGovernanceInspectionColumns() {
  const types = governanceState.data.settings.checkTypes;
  return `
    <div class="inspection-type-grid">
      ${types.map((type) => {
        const inspections = governanceState.data.inspections.filter((inspection) => (
          (inspection.checkTypeCode || checkTypeCodeFromName(inspection.checkType)) === type.code
        ));
        return `
          <section class="inspection-type-column">
            <div class="inspection-type-head">
              <strong>${escapeHtml(type.name)}</strong>
              <span>${inspections.length} 项</span>
            </div>
            <div class="governance-card-list compact-list">
              ${inspections.map((inspection) => renderGovernanceInspectionCard(inspection)).join("") || `<p class="hint">暂无${escapeHtml(type.name)}</p>`}
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderGovernanceInspectionCard(inspection) {
  return `
    <article class="governance-card ${governanceState.selectedInspectionId === inspection.id ? "selected" : ""}" data-inspection-id="${escapeAttr(inspection.id)}">
      <div>
        <strong>${escapeHtml(inspection.checkNo)}</strong>
        <p>${escapeHtml(inspection.checkName || "未命名检查")}</p>
        <small>${escapeHtml(inspection.checkDate)}｜${escapeHtml(inspection.checkPlace || "未填写地点")}｜${inspection.hazardCount || 0} 条隐患</small>
      </div>
      <div class="governance-card-actions">
        <button class="icon-button" type="button" data-action="select-inspection" title="选择">✓</button>
        <button class="icon-button" type="button" data-action="edit-inspection" title="编辑">✎</button>
        <button class="icon-button" type="button" data-action="delete-inspection" title="删除">×</button>
      </div>
    </article>
  `;
}

function bindGovernanceInspectionCardActions(content) {
  content.querySelectorAll("[data-inspection-id] [data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.closest("[data-inspection-id]").dataset.inspectionId;
      if (button.dataset.action === "select-inspection") {
        governanceState.selectedInspectionId = id;
        governanceState.activeTab = "ledger";
        governanceState.workflowFocus = "ledger";
      }
      if (button.dataset.action === "edit-inspection") {
        governanceState.editingInspectionId = id;
      }
      if (button.dataset.action === "delete-inspection") {
        const inspection = governanceState.data.inspections.find((item) => item.id === id);
        if (!window.confirm(`确认删除 ${inspection?.checkNo || "该检查"} 吗？对应隐患也会一并删除。`)) return;
        governanceState.data.inspections = governanceState.data.inspections.filter((item) => item.id !== id);
        governanceState.data.hazards = governanceState.data.hazards.filter((item) => item.checkNo !== inspection?.checkNo);
        if (governanceState.selectedInspectionId === id) governanceState.selectedInspectionId = "";
        await saveGovernanceData();
        showToast("已删除");
      }
      renderHazardGovernanceModule();
    });
  });
}

async function saveGovernanceInspectionFromForm(event) {
  event.preventDefault();
  const typeCode = document.querySelector("#govCheckTypeCode").value;
  const checkDate = document.querySelector("#govCheckDate").value || getTodayDate();
  const checkNo = document.querySelector("#govCheckNo").value.trim();
  const checkName = document.querySelector("#govCheckName").value.trim();
  const checkPlace = document.querySelector("#govCheckPlace").value.trim();
  if (!checkNo || !checkName || !checkPlace) {
    showToast("请填写检查编号、检查名称和检查地点");
    return;
  }
  const duplicate = governanceState.data.inspections.find((item) => (
    item.checkNo === checkNo && item.id !== governanceState.editingInspectionId
  ));
  if (duplicate) {
    showToast("检查编号已存在，请调整编号");
    return;
  }
  const now = new Date().toISOString();
  const editing = governanceState.data.inspections.find((item) => item.id === governanceState.editingInspectionId);
  const oldCheckNo = editing?.checkNo;
  const inspection = {
    id: editing?.id || createId(),
    checkNo,
    checkType: checkTypeNameFromCode(typeCode),
    checkTypeCode: typeCode,
    checkName,
    checkDate,
    checkPlace,
    leadDept: document.querySelector("#govLeadDept").value.trim(),
    isSelfResponsible: document.querySelector("#govIsSelfResponsible").checked,
    groupLeader: document.querySelector("#govGroupLeader").value.trim(),
    noticeFileName: document.querySelector("#govNoticeFileName").value.trim(),
    opinionFileName: document.querySelector("#govOpinionFileName").value.trim(),
    hazardCount: editing?.hazardCount || 0,
    folderName: "",
    remark: document.querySelector("#govRemark").value.trim(),
    createdAt: editing?.createdAt || now,
    updatedAt: now
  };
  inspection.folderName = buildInspectionFolderName(inspection);

  if (editing) {
    governanceState.data.inspections = governanceState.data.inspections.map((item) => item.id === editing.id ? inspection : item);
    governanceState.data.hazards = governanceState.data.hazards.map((hazard) => hazard.checkNo === oldCheckNo ? {
      ...hazard,
      checkNo: inspection.checkNo,
      hazardNo: renameGovernanceHazardNoPrefix(hazard.hazardNo, oldCheckNo, inspection.checkNo),
      checkType: inspection.checkType,
      checkDate: inspection.checkDate,
      checkPlace: inspection.checkPlace
    } : hazard);
    showToast("检查已更新");
  } else {
    governanceState.data.inspections.unshift(inspection);
    governanceState.selectedInspectionId = inspection.id;
    showToast("检查已新建");
  }
  governanceState.editingInspectionId = "";
  await saveGovernanceData();
  renderHazardGovernanceModule();
}

function syncGeneratedGovernanceCheckNo(typeCode, dateText) {
  const input = document.querySelector("#govCheckNo");
  const badge = document.querySelector(".code-badge");
  if (!input || !badge) return;
  const next = previewNextGovernanceCheckNo(typeCode, dateText);
  const current = input.value.trim();
  if (!current || current === input.dataset.generated) {
    input.value = next;
  }
  input.dataset.generated = next;
  badge.textContent = input.value.trim() || next;
}

function renameGovernanceHazardNoPrefix(hazardNo, oldCheckNo, newCheckNo) {
  const text = String(hazardNo || "");
  if (oldCheckNo && text.startsWith(`${oldCheckNo}-`)) {
    return `${newCheckNo}-${text.slice(oldCheckNo.length + 1)}`;
  }
  const suffix = text.match(/(\d{3})$/)?.[1] || "001";
  return `${newCheckNo}-${suffix}`;
}

function renderGovernanceLedgerPage(content) {
  const filtered = getFilteredGovernanceHazards();
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>隐患总台账</h2>
          <p class="hint">用于查看全部隐患、筛选状态和导出台账。责任分配请到“治理表/报告”中批量或逐条确认。当前共 ${governanceState.data.hazards.length} 条，筛选后 ${filtered.length} 条。</p>
        </div>
        <div class="actions">
          <button id="exportFilteredLedgerButton" class="button" type="button">导出当前台账</button>
        </div>
      </div>
      ${renderGovernanceFilters()}
      ${renderGovernanceLedgerFieldSettings()}
    </section>
    ${renderGovernanceLedgerTable(filtered)}
  `;
  bindGovernanceLedgerEvents(content);
}

function renderGovernanceHazardEntryPage(content) {
  const inspection = getSelectedGovernanceInspection();
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>${governanceState.editingHazardId ? "编辑检查隐患" : "检查采集录入"}</h2>
          <p class="hint">${inspection ? `归属检查：${escapeHtml(inspection.checkNo)} ${escapeHtml(inspection.checkName)}。这里只录入问题、整改措施和整改前照片。` : "请先在检查登记中选择一项检查。这里只录入问题、整改措施和整改前照片。"}</p>
        </div>
        <span class="code-badge">${inspection ? previewNextGovernanceHazardNo(inspection.checkNo) : "未选择检查"}</span>
      </div>
      ${renderGovernanceHazardForm(inspection)}
    </section>
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>分组检查汇总</h2>
          <p class="hint">分组检查后可导入标准隐患治理表，自动生成检查任务和隐患编号；责任信息可在“治理表/报告”集中调整。</p>
        </div>
        <div class="actions">
          <button id="importGovernanceTableButton" class="button primary" type="button">导入隐患治理表</button>
          <button id="goLedgerFromEntryButton" class="button" type="button">进入隐患确认</button>
          <input id="governanceTableExcelInput" class="hidden" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
        </div>
      </div>
    </section>
  `;
  bindGovernanceHazardEntryEvents(content);
}

function renderGovernanceFilters() {
  const options = governanceState.data.settings;
  const inspectionOptions = governanceState.data.inspections.map((item) => `<option value="${escapeAttr(item.checkNo)}" ${governanceState.ledgerFilters.checkNo === item.checkNo ? "selected" : ""}>${escapeHtml(item.checkNo)} ${escapeHtml(item.checkName)}</option>`).join("");
  return `
    <div class="governance-filter-grid">
      <input id="govLedgerKeyword" class="input" type="search" value="${escapeAttr(governanceState.ledgerKeyword)}" placeholder="搜索问题隐患或整改措施">
      <select class="select" data-filter="checkTypeCode"><option value="">全部检查类型</option>${options.checkTypes.map((type) => `<option value="${type.code}" ${governanceState.ledgerFilters.checkTypeCode === type.code ? "selected" : ""}>${type.name}</option>`).join("")}</select>
      <select class="select" data-filter="checkNo"><option value="">全部检查编号</option>${inspectionOptions}</select>
      <select class="select" data-filter="responsibleDept"><option value="">全部责任部门</option>${options.responsibleDepts.map((name) => `<option ${governanceState.ledgerFilters.responsibleDept === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select>
      <select class="select" data-filter="currentStatus"><option value="">全部手动状态</option>${options.statuses.map((name) => `<option ${governanceState.ledgerFilters.currentStatus === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select>
      <select class="select" data-filter="autoStatus"><option value="">全部自动状态</option>${["整改中", "已整改", "延期整改", "已逾期"].map((name) => `<option ${governanceState.ledgerFilters.autoStatus === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select>
      <select class="select" data-filter="hazardLevel"><option value="">全部隐患等级</option>${options.hazardLevels.map((name) => `<option ${governanceState.ledgerFilters.hazardLevel === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select>
      <select class="select" data-filter="hazardType"><option value="">全部隐患类型</option>${Object.keys(options.hazardTypes).map((name) => `<option ${governanceState.ledgerFilters.hazardType === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select>
    </div>
  `;
}

function renderGovernanceLedgerFieldSettings() {
  const displayFields = new Set(governanceState.ledgerDisplayFields);
  const exportFields = new Set(governanceState.ledgerExportFields);
  return `
    <details id="ledgerFieldSettings" class="ledger-field-settings" ${governanceState.ledgerFieldSettingsOpen ? "open" : ""}>
      <summary>
        <span>字段设置</span>
        <small>可分别选择页面显示字段和 Excel 导出字段</small>
      </summary>
      <div class="ledger-field-groups">
        <div class="ledger-field-group">
          <div class="ledger-field-group-head">
            <b>表格显示字段</b>
            <div class="mini-actions">
              <button class="text-button" type="button" data-field-action="display-all">全选</button>
              <button class="text-button" type="button" data-field-action="display-default">默认</button>
            </div>
          </div>
          <div class="field-check-grid">
            ${GOVERNANCE_LEDGER_FIELDS.map((field) => `
              <label class="field-check">
                <input type="checkbox" value="${escapeAttr(field.key)}" data-ledger-field-mode="display" ${displayFields.has(field.key) ? "checked" : ""}>
                <span>${escapeHtml(field.label)}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="ledger-field-group">
          <div class="ledger-field-group-head">
            <b>Excel 导出字段</b>
            <div class="mini-actions">
              <button class="text-button" type="button" data-field-action="export-all">全选</button>
              <button class="text-button" type="button" data-field-action="export-default">默认</button>
            </div>
          </div>
          <div class="field-check-grid">
            ${GOVERNANCE_LEDGER_FIELDS.map((field) => `
              <label class="field-check">
                <input type="checkbox" value="${escapeAttr(field.key)}" data-ledger-field-mode="export" ${exportFields.has(field.key) ? "checked" : ""}>
                <span>${escapeHtml(field.label)}</span>
              </label>
            `).join("")}
          </div>
        </div>
      </div>
    </details>
  `;
}

function renderGovernanceHazardForm(inspection) {
  const editing = governanceState.data.hazards.find((item) => item.id === governanceState.editingHazardId);
  const settings = governanceState.data.settings;
  const hazardType = editing?.hazardType || Object.keys(settings.hazardTypes)[0] || "";
  const professionalOptions = settings.hazardTypes[hazardType] || [];
  return `
    <form id="governanceHazardForm" class="form-grid compact-form">
      <label class="field"><span>归属检查</span><select id="govHazardInspectionId" class="select">${governanceState.data.inspections.map((item) => `<option value="${item.id}" ${(editing ? item.checkNo === editing.checkNo : item.id === governanceState.selectedInspectionId) ? "selected" : ""}>${escapeHtml(item.checkNo)} ${escapeHtml(item.checkName)}</option>`).join("")}</select></label>
      <label class="field"><span>隐患等级</span><select id="govHazardLevel" class="select">${settings.hazardLevels.map((name) => `<option ${editing?.hazardLevel === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
      <label class="field"><span>隐患类型</span><select id="govHazardType" class="select">${Object.keys(settings.hazardTypes).map((name) => `<option ${hazardType === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
      <label class="field"><span>专业类型</span><select id="govProfessionalType" class="select">${professionalOptions.map((name) => `<option ${editing?.professionalType === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
      <label class="field span-2"><span>问题隐患</span><textarea id="govProblem" class="textarea" placeholder="填写问题隐患">${escapeHtml(editing?.problem || "")}</textarea></label>
      <label class="field span-2"><span>整改措施</span><textarea id="govMeasures" class="textarea" placeholder="填写拟采取的整改措施">${escapeHtml(editing?.rectificationMeasures || "")}</textarea></label>
      <label class="field span-2"><span>整改前照片</span><input id="govBeforePhotos" class="input" type="file" accept="image/*" multiple></label>
      <div class="actions span-2">
        <button class="button primary" type="submit" ${inspection || editing ? "" : "disabled"}>${editing ? "更新隐患" : "保存隐患"}</button>
        ${editing ? `<button id="cancelGovHazardEdit" class="button" type="button">取消编辑</button>` : ""}
      </div>
    </form>
  `;
}

function renderGovernanceHazardCard(hazard, index) {
  return `
    <article class="hazard-card glass governance-ledger-card" data-hazard-id="${escapeAttr(hazard.id)}">
      <div class="hazard-summary-row">
        <input class="gov-hazard-checkbox" type="checkbox" value="${escapeAttr(hazard.id)}" aria-label="选择隐患">
        <div class="hazard-summary-main">
          <span class="hazard-summary-index">${index + 1}</span>
          <p class="hazard-summary-problem">${escapeHtml(hazard.problem || "未填写隐患")}</p>
          <span class="hazard-summary-location">${escapeHtml(hazard.checkPlace || "未填写地点")}｜${escapeHtml(hazard.responsibleDept || "未分配")}｜${escapeHtml(hazard.autoStatus)}</span>
        </div>
        <div class="hazard-mini-actions">
          <button class="icon-button" type="button" data-action="edit-hazard" title="编辑">✎</button>
          <button class="icon-button" type="button" data-action="delete-hazard" title="删除">×</button>
        </div>
      </div>
      <details class="hazard-details">
        <summary>展开详情</summary>
        <div class="governance-detail-grid">
          <p><b>检查编号：</b>${escapeHtml(hazard.checkNo)}</p>
          <p><b>隐患编号：</b>${escapeHtml(hazard.hazardNo)}</p>
          <p><b>整改措施：</b>${escapeHtml(hazard.rectificationMeasures)}</p>
          <p><b>督办领导：</b>${escapeHtml(hazard.supervisionLeader || "未填写")}</p>
          <p><b>责任部门：</b>${escapeHtml(hazard.responsibleDept || "未填写")}</p>
          <p><b>责任人：</b>${escapeHtml(hazard.responsiblePerson || "未填写")}</p>
          <p><b>整改期限：</b>${escapeHtml(hazard.deadline || "未填写")}</p>
          <p><b>平台闭环：</b>${escapeHtml(hazard.platformCloseStatus)}</p>
          <p class="span-2"><b>完成情况：</b>${escapeHtml(hazard.handlingMeasures || "未填写")}</p>
        </div>
      </details>
    </article>
  `;
}

function renderGovernanceLedgerTable(hazards) {
  if (!hazards.length) {
    return `<div class="empty-state glass"><h3>暂无符合条件的隐患</h3><p>可以调整筛选条件，或到“隐患录入”新增数据。</p></div>`;
  }
  const fields = getSelectedGovernanceLedgerFields("display");
  const tableMinWidth = Math.max(760, fields.length * 128 + 112);

  return `
    <section class="tool-card glass ledger-table-card">
      <div class="governance-table-wrap">
        <table class="governance-table" style="min-width:${tableMinWidth}px">
          <thead>
            <tr>
              ${fields.map((field) => `<th class="${escapeAttr(field.className || "")}">${escapeHtml(field.label)}</th>`).join("")}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${hazards.map((hazard, index) => `
            <tr data-hazard-id="${escapeAttr(hazard.id)}">
              ${fields.map((field) => `<td class="${escapeAttr(field.className || "")}">${renderGovernanceLedgerCell(field, hazard, index)}</td>`).join("")}
              <td class="table-actions">
                <button class="icon-button" type="button" data-action="edit-hazard" title="编辑隐患">✎</button>
                <button class="icon-button" type="button" data-action="rectify-hazard" title="整改">✓</button>
                <button class="icon-button" type="button" data-action="delete-hazard" title="删除">×</button>
              </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderGovernanceLedgerCell(field, hazard, index) {
  const value = getGovernanceLedgerFieldValue(field, hazard, index);
  if (field.key === "autoStatus") {
    return `<span class="status-pill ${getGovernanceStatusClass(value)}">${escapeHtml(value)}</span>`;
  }
  return escapeHtml(value);
}

function bindGovernanceLedgerEvents(content) {
  content.querySelector("#exportFilteredLedgerButton").addEventListener("click", () => exportGovernanceLedger(getFilteredGovernanceHazards(), "隐患台账.xlsx"));
  bindGovernanceLedgerFieldEvents(content);
  content.querySelector("#govLedgerKeyword").addEventListener("input", (event) => {
    governanceState.ledgerKeyword = event.target.value.trim();
    renderGovernanceActiveTab();
  });
  content.querySelectorAll("[data-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      governanceState.ledgerFilters[input.dataset.filter] = input.value;
      renderGovernanceActiveTab();
    });
  });
  content.querySelectorAll("[data-hazard-id] [data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.closest("[data-hazard-id]").dataset.hazardId;
      if (button.dataset.action === "edit-hazard") {
        governanceState.editingHazardId = id;
        governanceState.activeTab = "hazardEntry";
        governanceState.workflowFocus = "capture";
        renderHazardGovernanceModule();
        return;
      }
      if (button.dataset.action === "rectify-hazard") {
        governanceState.editingHazardId = id;
        governanceState.activeTab = "rectification";
        governanceState.workflowFocus = "rectify";
        renderHazardGovernanceModule();
        return;
      }
      if (button.dataset.action === "delete-hazard") {
        if (!window.confirm("确认删除该隐患吗？此操作不可恢复。")) return;
        governanceState.data.hazards = governanceState.data.hazards.filter((item) => item.id !== id);
        await saveGovernanceData();
        showToast("已删除");
        renderGovernanceActiveTab();
      }
    });
  });
}

function bindGovernanceLedgerFieldEvents(content) {
  const details = content.querySelector("#ledgerFieldSettings");
  details?.addEventListener("toggle", () => {
    governanceState.ledgerFieldSettingsOpen = details.open;
  });

  content.querySelectorAll("[data-ledger-field-mode]").forEach((input) => {
    input.addEventListener("change", () => {
      updateGovernanceLedgerFieldsFromInputs(content, input.dataset.ledgerFieldMode);
    });
  });

  content.querySelectorAll("[data-field-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const [mode, action] = button.dataset.fieldAction.split("-");
      const keys = action === "all"
        ? GOVERNANCE_LEDGER_FIELDS.map((field) => field.key)
        : getDefaultGovernanceLedgerFieldKeys(mode);
      setGovernanceLedgerFields(mode, keys);
      governanceState.ledgerFieldSettingsOpen = true;
      renderGovernanceActiveTab();
    });
  });
}

function updateGovernanceLedgerFieldsFromInputs(content, mode) {
  const selector = `[data-ledger-field-mode="${mode}"]`;
  const keys = Array.from(content.querySelectorAll(selector))
    .filter((input) => input.checked)
    .map((input) => input.value);

  if (!keys.length) {
    showToast("至少保留一个字段");
    const defaults = getDefaultGovernanceLedgerFieldKeys(mode);
    setGovernanceLedgerFields(mode, defaults);
    governanceState.ledgerFieldSettingsOpen = true;
    renderGovernanceActiveTab();
  } else {
    setGovernanceLedgerFields(mode, keys);
    if (mode === "display") {
      governanceState.ledgerFieldSettingsOpen = true;
      renderGovernanceActiveTab();
    } else {
      showToast("导出字段已更新");
    }
  }
}

function setGovernanceLedgerFields(mode, keys) {
  const normalized = normalizeGovernanceLedgerFieldKeys(keys, mode);
  if (mode === "display") {
    governanceState.ledgerDisplayFields = normalized;
    saveGovernanceLedgerFields(GOVERNANCE_LEDGER_DISPLAY_FIELDS_KEY, normalized);
    return;
  }
  governanceState.ledgerExportFields = normalized;
  saveGovernanceLedgerFields(GOVERNANCE_LEDGER_EXPORT_FIELDS_KEY, normalized);
}

function bindGovernanceHazardEntryEvents(content) {
  content.querySelector("#governanceHazardForm").addEventListener("submit", saveGovernanceHazardFromForm);
  content.querySelector("#govHazardType").addEventListener("change", () => renderGovernanceActiveTab());
  content.querySelector("#cancelGovHazardEdit")?.addEventListener("click", () => {
    governanceState.editingHazardId = "";
    renderGovernanceActiveTab();
  });
  content.querySelector("#importGovernanceTableButton").addEventListener("click", () => content.querySelector("#governanceTableExcelInput").click());
  content.querySelector("#governanceTableExcelInput").addEventListener("change", importGovernanceTableExcel);
  content.querySelector("#goLedgerFromEntryButton").addEventListener("click", () => {
    governanceState.activeTab = "ledger";
    governanceState.workflowFocus = "ledger";
    renderHazardGovernanceModule();
  });
}

function getGovernanceStatusClass(status) {
  if (status === "已整改") return "status-done";
  if (status === "已逾期") return "status-overdue";
  if (status === "延期整改") return "status-delay";
  return "status-progress";
}

/*
 * Kept for older card views; ledger now uses the table renderer above.
 */
function bindGovernanceLegacyCardEvents(content) {
  content.querySelector("#governanceHazardForm").addEventListener("submit", saveGovernanceHazardFromForm);
  content.querySelector("#govHazardType").addEventListener("change", () => renderGovernanceActiveTab());
  content.querySelector("#cancelGovHazardEdit")?.addEventListener("click", () => {
    governanceState.editingHazardId = "";
    renderGovernanceActiveTab();
  });
  content.querySelector("#applyGovBulkButton").addEventListener("click", applyGovernanceBulkUpdate);
  content.querySelectorAll("[data-hazard-id] [data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.closest("[data-hazard-id]").dataset.hazardId;
      if (button.dataset.action === "edit-hazard") {
        governanceState.editingHazardId = id;
        document.querySelector("#governanceContent").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (button.dataset.action === "delete-hazard") {
        if (!window.confirm("确认删除该隐患吗？此操作不可恢复。")) return;
        governanceState.data.hazards = governanceState.data.hazards.filter((item) => item.id !== id);
        await saveGovernanceData();
        showToast("已删除");
      }
      renderGovernanceActiveTab();
    });
  });
}

function renderGovernanceRectificationPage(content) {
  const hazards = getFilteredGovernanceHazards();
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>隐患整改</h2>
          <p class="hint">集中维护整改状态、处理措施、延期信息、整改后照片和平台闭环状态。</p>
        </div>
        <button id="goLedgerFromRectificationButton" class="button" type="button">查看总台账</button>
      </div>
      ${renderGovernanceFilters()}
    </section>
    <section class="governance-ledger-list">
      ${hazards.map((hazard, index) => renderGovernanceRectificationCard(hazard, index)).join("") || `<div class="empty-state glass"><h3>暂无符合条件的隐患</h3><p>可以调整筛选条件。</p></div>`}
    </section>
  `;
  bindGovernanceRectificationEvents(content);
}

function renderGovernanceRectificationCard(hazard, index) {
  const settings = governanceState.data.settings;
  return `
    <article class="tool-card glass rectification-ledger-card" data-hazard-id="${escapeAttr(hazard.id)}">
      <div class="rectification-card-head">
        <div>
          <span class="hazard-summary-index">${index + 1}</span>
          <strong>${escapeHtml(hazard.hazardNo || "未编号")}</strong>
          <p>${escapeHtml(hazard.problem || "未填写隐患")}</p>
          <small>${escapeHtml(hazard.checkPlace || "未填写地点")}｜${escapeHtml(hazard.responsibleDept || "未分配")}｜${escapeHtml(hazard.deadline || "未填写期限")}</small>
        </div>
        <span class="status-pill ${getGovernanceStatusClass(hazard.autoStatus)}">${escapeHtml(hazard.autoStatus)}</span>
      </div>
      <div class="governance-detail-grid rectification-editor-grid">
        <label class="field"><span>整改状态</span><select class="select rect-current-status">${settings.statuses.map((name) => `<option ${hazard.currentStatus === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
        <label class="field"><span>平台闭环</span><select class="select rect-platform-status">${settings.platformCloseStatuses.map((name) => `<option ${hazard.platformCloseStatus === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
        <label class="field"><span>验收人</span><input class="input rect-acceptor" value="${escapeAttr(hazard.acceptor || "")}"></label>
        <label class="field"><span>延期后期限</span><input class="input rect-extension-deadline" type="date" value="${escapeAttr(hazard.extensionDeadline || "")}"></label>
        <label class="field span-2"><span>处理措施 / 完成情况</span><textarea class="textarea small-textarea rect-handling">${escapeHtml(hazard.handlingMeasures || "")}</textarea></label>
        <label class="field span-2"><span>延期原因</span><input class="input rect-extension-reason" value="${escapeAttr(hazard.extensionReason || "")}"></label>
        <label class="field span-2"><span>整改后照片</span><input class="input rect-after-photos" type="file" accept="image/*" multiple></label>
      </div>
      <div class="photo-strip">
        ${(hazard.afterPhotos || []).slice(0, 4).map((photo) => `<img src="${escapeAttr(photo.dataUrl || photo.watermarkedDataUrl || "")}" alt="整改后照片">`).join("") || `<span class="hint">暂无整改后照片</span>`}
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-action="save-rectification">保存整改</button>
        <button class="button" type="button" data-action="edit-hazard">编辑隐患基础信息</button>
      </div>
    </article>
  `;
}

function bindGovernanceRectificationEvents(content) {
  content.querySelector("#goLedgerFromRectificationButton").addEventListener("click", () => {
    governanceState.activeTab = "ledger";
    governanceState.workflowFocus = "ledger";
    renderHazardGovernanceModule();
  });
  content.querySelector("#govLedgerKeyword").addEventListener("input", (event) => {
    governanceState.ledgerKeyword = event.target.value.trim();
    renderGovernanceActiveTab();
  });
  content.querySelectorAll("[data-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      governanceState.ledgerFilters[input.dataset.filter] = input.value;
      renderGovernanceActiveTab();
    });
  });
  content.querySelectorAll("[data-hazard-id] [data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest("[data-hazard-id]");
      const hazardId = card.dataset.hazardId;
      if (button.dataset.action === "edit-hazard") {
        governanceState.editingHazardId = hazardId;
        governanceState.activeTab = "hazardEntry";
        governanceState.workflowFocus = "capture";
        renderHazardGovernanceModule();
        return;
      }
      if (button.dataset.action === "save-rectification") {
        await saveGovernanceRectificationFromCard(card);
      }
    });
  });
}

async function saveGovernanceRectificationFromCard(card) {
  const hazardId = card.dataset.hazardId;
  const hazard = governanceState.data.hazards.find((item) => item.id === hazardId);
  if (!hazard) {
    showToast("未找到隐患");
    return;
  }
  const afterPhotos = await readGovernancePhotoInput(card.querySelector(".rect-after-photos").files, hazard.afterPhotos || [], "整改后");
  const updated = {
    ...hazard,
    currentStatus: card.querySelector(".rect-current-status").value,
    platformCloseStatus: card.querySelector(".rect-platform-status").value,
    acceptor: card.querySelector(".rect-acceptor").value.trim(),
    handlingMeasures: card.querySelector(".rect-handling").value.trim(),
    extensionReason: card.querySelector(".rect-extension-reason").value.trim(),
    extensionDeadline: card.querySelector(".rect-extension-deadline").value,
    afterPhotos,
    afterPhotoMain: hazard.afterPhotoMain || afterPhotos[0]?.id || "",
    feedbackSource: "电脑端整改",
    updatedAt: new Date().toISOString()
  };
  updated.autoStatus = computeGovernanceAutoStatus(updated);
  governanceState.data.hazards = governanceState.data.hazards.map((item) => item.id === hazardId ? updated : item);
  await saveGovernanceData();
  showToast("整改信息已保存");
  renderGovernanceActiveTab();
}

async function saveGovernanceHazardFromForm(event) {
  event.preventDefault();
  const inspection = governanceState.data.inspections.find((item) => item.id === document.querySelector("#govHazardInspectionId").value);
  if (!inspection) {
    showToast("请先选择归属检查");
    return;
  }
  const problem = document.querySelector("#govProblem").value.trim();
  const rectificationMeasures = document.querySelector("#govMeasures").value.trim();
  if (!problem || !rectificationMeasures) {
    showToast("请填写问题隐患和整改措施");
    return;
  }
  const editing = governanceState.data.hazards.find((item) => item.id === governanceState.editingHazardId);
  const photos = await readGovernancePhotoInput(document.querySelector("#govBeforePhotos").files, editing?.beforePhotos || [], "整改前");
  const now = new Date().toISOString();
  const hazard = {
    id: editing?.id || createId(),
    checkNo: inspection.checkNo,
    hazardNo: editing?.hazardNo || generateGovernanceHazardNo(inspection.checkNo),
    checkType: inspection.checkType,
    checkDate: inspection.checkDate,
    checkPlace: inspection.checkPlace,
    hazardLevel: document.querySelector("#govHazardLevel").value,
    hazardType: document.querySelector("#govHazardType").value,
    professionalType: document.querySelector("#govProfessionalType").value,
    problem,
    rectificationMeasures,
    supervisionLeader: editing?.supervisionLeader || "",
    responsibleDept: editing?.responsibleDept || "",
    responsiblePerson: editing?.responsiblePerson || "",
    deadline: editing?.deadline || "",
    acceptor: editing?.acceptor || "",
    handlingMeasures: editing?.handlingMeasures || "",
    currentStatus: editing?.currentStatus || "整改中",
    autoStatus: "整改中",
    platformCloseStatus: editing?.platformCloseStatus || "未上传",
    extensionReason: editing?.extensionReason || "",
    extensionDeadline: editing?.extensionDeadline || "",
    beforePhotos: photos,
    afterPhotos: editing?.afterPhotos || [],
    beforePhotoMain: editing?.beforePhotoMain || photos[0]?.id || "",
    afterPhotoMain: editing?.afterPhotoMain || "",
    feedbackSource: editing?.feedbackSource || "电脑端录入",
    createdAt: editing?.createdAt || now,
    updatedAt: now
  };
  hazard.autoStatus = computeGovernanceAutoStatus(hazard);
  if (editing) {
    governanceState.data.hazards = governanceState.data.hazards.map((item) => item.id === editing.id ? hazard : item);
    showToast("隐患已更新");
  } else {
    governanceState.data.hazards.push(hazard);
    showToast("隐患已保存");
  }
  governanceState.selectedInspectionId = inspection.id;
  governanceState.editingHazardId = "";
  await saveGovernanceData();
  renderGovernanceActiveTab();
}

async function readGovernancePhotoInput(fileList, existingPhotos, label) {
  const files = Array.from(fileList || []);
  if (!files.length) return existingPhotos;
  const photos = [...existingPhotos];
  for (const file of files) {
    const dataUrl = await createCompressedPhoto(file, 1200, 0.8);
    photos.push({
      id: createId(),
      name: `${label}-${photos.length + 1}.jpg`,
      dataUrl,
      mimeType: "image/jpeg"
    });
  }
  return photos;
}

async function applyGovernanceBulkUpdate() {
  const ids = Array.from(document.querySelectorAll(".gov-hazard-checkbox:checked")).map((input) => input.value);
  if (!ids.length) {
    showToast("请先勾选隐患");
    return;
  }
  const values = {
    supervisionLeader: document.querySelector("#bulkSupervisionLeader").value.trim(),
    responsibleDept: document.querySelector("#bulkResponsibleDept").value.trim(),
    responsiblePerson: document.querySelector("#bulkResponsiblePerson").value.trim(),
    deadline: document.querySelector("#bulkDeadline").value
  };
  governanceState.data.hazards = governanceState.data.hazards.map((hazard) => ids.includes(hazard.id) ? {
    ...hazard,
    ...Object.fromEntries(Object.entries(values).filter(([, value]) => value)),
    updatedAt: new Date().toISOString()
  } : hazard);
  await saveGovernanceData();
  showToast("批量修改成功");
  renderGovernanceActiveTab();
}

function renderGovernanceTaskExportPage(content) {
  const inspections = governanceState.data.inspections;
  const inspection = getSelectedGovernanceInspection();
  const depts = [...new Set(governanceState.data.hazards.filter((item) => !inspection || item.checkNo === inspection.checkNo).map((item) => item.responsibleDept).filter(Boolean))];
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title"><h2>任务下发</h2><p class="hint">确认治理表和初版报告后，按责任部门导出整改任务 JSON，或配合话术发送给责任部门。</p></div>
      <div class="compact-form">
        <label class="field"><span>检查任务</span><select id="taskInspectionId" class="select">${inspections.map((item) => `<option value="${item.id}" ${item.id === governanceState.selectedInspectionId ? "selected" : ""}>${escapeHtml(item.checkNo)} ${escapeHtml(item.checkName)}</option>`).join("")}</select></label>
        <label class="field"><span>责任部门</span><select id="taskResponsibleDept" class="select"><option value="">全部责任部门</option>${depts.map((name) => `<option>${escapeHtml(name)}</option>`).join("")}</select></label>
        <button id="exportTaskJsonButton" class="button primary" type="button">导出整改任务 JSON</button>
      </div>
    </section>
  `;
  content.querySelector("#taskInspectionId").addEventListener("change", (event) => {
    governanceState.selectedInspectionId = event.target.value;
    renderGovernanceActiveTab();
  });
  content.querySelector("#exportTaskJsonButton").addEventListener("click", exportGovernanceTaskJson);
}

function exportGovernanceTaskJson() {
  const inspection = getSelectedGovernanceInspection();
  if (!inspection) {
    showToast("请先选择检查任务");
    return;
  }
  const dept = document.querySelector("#taskResponsibleDept").value;
  const hazards = governanceState.data.hazards.filter((hazard) => hazard.checkNo === inspection.checkNo && (!dept || hazard.responsibleDept === dept));
  if (!hazards.length) {
    showToast("没有可导出的整改任务");
    return;
  }
  const data = {
    schemaVersion: "hazard-rectification-v1",
    exportType: "rectification-task",
    exportedAt: new Date().toISOString(),
    checkNo: inspection.checkNo,
    checkName: inspection.checkName,
    responsibleDept: dept || "全部责任部门",
    hazards: hazards.map((hazard) => ({
      id: hazard.id,
      hazardNo: hazard.hazardNo,
      problem: hazard.problem,
      rectificationMeasures: hazard.rectificationMeasures,
      deadline: hazard.deadline,
      responsiblePerson: hazard.responsiblePerson,
      beforePhotos: hazard.beforePhotos
    }))
  };
  downloadTextFile(`${inspection.checkNo}-${safeFilePart(dept || "全部责任部门")}-整改任务.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  showToast("整改任务 JSON 已导出");
}

function renderGovernanceFeedbackImportPage(content) {
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title"><h2>整改反馈汇总</h2><p class="hint">责任部门完成治理后，导入手机端反馈 JSON。导入前会预览可匹配数量和异常清单，确认后更新台账状态。</p></div>
      <div class="actions">
        <button id="chooseFeedbackJsonButton" class="button primary" type="button">选择整改反馈 JSON</button>
        <input id="feedbackJsonInput" class="hidden" type="file" accept="application/json,.json">
      </div>
      <div id="feedbackPreviewPanel" class="preview-panel"></div>
    </section>
  `;
  content.querySelector("#chooseFeedbackJsonButton").addEventListener("click", () => content.querySelector("#feedbackJsonInput").click());
  content.querySelector("#feedbackJsonInput").addEventListener("change", previewGovernanceFeedbackImport);
}

async function previewGovernanceFeedbackImport(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    const data = await readJsonFile(file);
    if (data.schemaVersion !== "hazard-feedback-v1" || !Array.isArray(data.hazards)) {
      throw new Error("整改反馈 JSON 格式不正确");
    }
    const result = buildFeedbackImportPreview(data);
    governanceState.feedbackImportDraft = { data, result };
    document.querySelector("#feedbackPreviewPanel").innerHTML = `
      <div class="empty-state glass subtle">
        <h3>导入预览</h3>
        <p>可更新 ${result.matched.length} 条，未找到 ${result.missing.length} 条，重复 ${result.duplicates.length} 条。</p>
        ${result.missing.length ? `<p class="hint">未找到：${result.missing.map((item) => escapeHtml(item.hazardNo || item.id || "未知")).join("、")}</p>` : ""}
        <button id="confirmFeedbackImportButton" class="button primary" type="button">确认导入并更新台账</button>
      </div>
    `;
    document.querySelector("#confirmFeedbackImportButton").addEventListener("click", confirmGovernanceFeedbackImport);
  } catch (error) {
    showToast(error.message || "反馈导入失败");
  }
}

function buildFeedbackImportPreview(data) {
  const seen = new Set();
  const matched = [];
  const missing = [];
  const duplicates = [];
  data.hazards.forEach((feedback) => {
    const key = feedback.id || feedback.hazardNo;
    if (seen.has(key)) {
      duplicates.push(feedback);
      return;
    }
    seen.add(key);
    const hazard = governanceState.data.hazards.find((item) => item.id === feedback.id || item.hazardNo === feedback.hazardNo);
    if (hazard) matched.push({ hazard, feedback });
    else missing.push(feedback);
  });
  return { matched, missing, duplicates };
}

async function confirmGovernanceFeedbackImport() {
  const draft = governanceState.feedbackImportDraft;
  if (!draft) return;
  if (!window.confirm(`确认更新 ${draft.result.matched.length} 条隐患吗？`)) return;
  governanceState.data.hazards = governanceState.data.hazards.map((hazard) => {
    const matched = draft.result.matched.find((item) => item.hazard.id === hazard.id);
    if (!matched) return hazard;
    const feedback = matched.feedback;
    const updated = {
      ...hazard,
      currentStatus: feedback.currentStatus || hazard.currentStatus,
      handlingMeasures: feedback.handlingMeasures || hazard.handlingMeasures,
      afterPhotos: normalizeGovernancePhotos(feedback.afterPhotos || hazard.afterPhotos),
      acceptor: feedback.acceptor || hazard.acceptor,
      extensionReason: feedback.extensionReason || hazard.extensionReason,
      extensionDeadline: feedback.extensionDeadline || hazard.extensionDeadline,
      feedbackSource: "手机端反馈",
      updatedAt: feedback.updatedAt || new Date().toISOString()
    };
    updated.autoStatus = computeGovernanceAutoStatus(updated);
    return updated;
  });
  governanceState.feedbackImportDraft = null;
  await saveGovernanceData();
  showToast("整改反馈已导入");
  renderGovernanceActiveTab();
}

function renderGovernanceReportPage(content) {
  const inspection = getSelectedGovernanceInspection();
  const hazards = inspection
    ? governanceState.data.hazards.filter((hazard) => hazard.checkNo === inspection.checkNo)
    : [];
  const stats = getGovernanceStats(hazards);
  const finishedCount = hazards.filter((hazard) => hazard.currentStatus === "已整改").length;
  const afterPhotoCount = hazards.filter((hazard) => (hazard.afterPhotos || []).length).length;
  const delayCount = hazards.filter((hazard) => hazard.currentStatus === "延期整改").length;
  const delayClosedCount = hazards.filter(isGovernanceDelayedCompletedHazard).length;
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>治理表与整改报告</h2>
          <p class="hint">检查确认后生成治理表和初版报告；反馈汇总后生成终版报告；有延期项时先出含延期版，延期完成后只生成补充报告。</p>
        </div>
      </div>
      <div class="compact-form">
        <label class="field"><span>检查任务</span><select id="reportInspectionId" class="select">${governanceState.data.inspections.map((item) => `<option value="${item.id}" ${item.id === governanceState.selectedInspectionId ? "selected" : ""}>${escapeHtml(item.checkNo)} ${escapeHtml(item.checkName)}</option>`).join("")}</select></label>
        <label class="field"><span>报告标题</span><input id="govReportTitle" class="input" value="${escapeAttr(inspection ? `关于落实${inspection.checkName}意见的情况报告` : "关于落实检查意见的情况报告")}"></label>
        <label class="field"><span>抬头部门</span><input id="govRecipient" class="input" value="安防环保部"></label>
        <label class="field"><span>落款公司</span><input id="govReportCompany" class="input" value="${escapeAttr(governanceState.data.settings.reportCompanies[0] || "锦原铀业有限公司")}"></label>
        <label class="checkline"><input id="govReportPhotos" type="checkbox" checked> 报告插入照片</label>
      </div>
      <div class="report-summary-strip">
        <span><b>${hazards.length}</b> 项隐患</span>
        <span><b>${finishedCount}</b> 项已整改</span>
        <span><b>${stats.overdue}</b> 项逾期</span>
        <span><b>${delayCount}</b> 项延期中</span>
        <span><b>${delayClosedCount}</b> 项延期已完成</span>
        <span><b>${afterPhotoCount}</b> 项有整改后照片</span>
        <span><b>${stats.notClosed}</b> 项平台未闭环</span>
      </div>
      <div class="report-stage-grid">
        <article class="report-stage-card">
          <span>检查确认后</span>
          <h3>治理表与初版报告</h3>
          <p>用于发送给相关责任部门，明确问题隐患、整改措施、责任部门和整改期限。</p>
          <div class="actions compact-actions">
            <button id="exportGovGovernanceTableButton" class="button" type="button">导出隐患治理表 Excel</button>
            <button id="exportInitialGovReportButton" class="button primary" type="button">导出初版整改报告</button>
            <button id="goTaskExportFromReportButton" class="button" type="button">整改任务导出</button>
          </div>
        </article>
        <article class="report-stage-card">
          <span>整改反馈后</span>
          <h3>终版整改报告</h3>
          <p>导入反馈并核对状态后生成。若存在延期项，可先生成含延期说明的归档版本。</p>
          <div class="actions compact-actions">
            <button id="goRectificationFromReportButton" class="button" type="button">进入整改汇总</button>
            <button id="exportFinalGovReportButton" class="button primary" type="button">导出终版整改报告</button>
            <button id="exportDelayIncludedGovReportButton" class="button" type="button">导出含延期版报告</button>
          </div>
        </article>
        <article class="report-stage-card">
          <span>延期完成后</span>
          <h3>补充闭环报告</h3>
          <p>延期隐患后续完成后，只抽取曾延期且已整改的隐患，生成补充整改报告。</p>
          <div class="actions compact-actions">
            <button id="exportDelaySupplementGovReportButton" class="button primary" type="button">导出延期补充报告</button>
          </div>
        </article>
      </div>
    </section>
    ${renderGovernanceReportAssignmentPanel(hazards)}
    <section class="tool-card glass">
      <div class="section-title">
        <div>
          <h2>本次检查隐患概览</h2>
          <p class="hint">${inspection ? `${escapeHtml(inspection.checkNo)}｜${escapeHtml(inspection.checkName || "未命名检查")}` : "暂无检查任务"}</p>
        </div>
      </div>
      ${renderGovernanceReportHazardOverview(hazards)}
    </section>
  `;
  content.querySelector("#reportInspectionId").addEventListener("change", (event) => {
    governanceState.selectedInspectionId = event.target.value;
    renderGovernanceActiveTab();
  });
  content.querySelector("#exportGovGovernanceTableButton").addEventListener("click", () => exportGovernanceTableFromModule());
  content.querySelector("#exportInitialGovReportButton").addEventListener("click", () => exportGovernanceWordReport("initial"));
  content.querySelector("#exportFinalGovReportButton").addEventListener("click", () => exportGovernanceWordReport("final"));
  content.querySelector("#exportDelayIncludedGovReportButton").addEventListener("click", () => exportGovernanceWordReport("delayIncluded"));
  content.querySelector("#exportDelaySupplementGovReportButton").addEventListener("click", () => exportGovernanceWordReport("delaySupplement"));
  content.querySelector("#goRectificationFromReportButton").addEventListener("click", () => {
    governanceState.activeTab = "rectification";
    governanceState.workflowFocus = "rectify";
    renderHazardGovernanceModule();
  });
  content.querySelector("#goTaskExportFromReportButton").addEventListener("click", () => {
    governanceState.activeTab = "tasks";
    governanceState.workflowFocus = "dispatch";
    renderHazardGovernanceModule();
  });
  bindGovernanceReportAssignmentEvents(content);
}

function renderGovernanceReportAssignmentPanel(hazards) {
  const settings = governanceState.data.settings;
  if (!hazards.length) {
    return `
      <section class="tool-card glass governance-assignment-panel">
        <div class="section-title">
          <div>
            <h2>治理责任分配</h2>
            <p class="hint">选择检查任务后，可在这里分配督办领导、治理责任单位或部门、治理责任人和整改时限。</p>
          </div>
        </div>
        <p class="hint">暂无可分配的隐患。</p>
      </section>
    `;
  }

  return `
    <section class="tool-card glass governance-assignment-panel">
      <div class="section-title">
        <div>
          <h2>治理责任分配</h2>
          <p class="hint">生成治理表和初版报告前，先在这里批量或逐条确认督办领导、责任部门、责任人和整改时限。</p>
        </div>
      </div>

      <div class="governance-bulk">
        <div class="governance-bulk-grid">
          <label class="field"><span>督办领导</span><input id="reportBulkSupervisionLeader" class="input" list="reportLeaderList" placeholder="仅填写需要批量覆盖的字段"></label>
          <label class="field"><span>治理责任单位或部门</span><input id="reportBulkResponsibleDept" class="input" list="reportDeptList" placeholder="仅填写需要批量覆盖的字段"></label>
          <label class="field"><span>治理责任人</span><input id="reportBulkResponsiblePerson" class="input" placeholder="仅填写需要批量覆盖的字段"></label>
          <label class="field"><span>整改时限</span><input id="reportBulkDeadline" class="input" type="date"></label>
        </div>
        <div class="assignment-number-panel">
          <div class="assignment-number-head">
            <strong>选择要批量修改的隐患</strong>
            <div class="actions">
              <button id="reportSelectAllHazards" class="button ghost" type="button">全选</button>
              <button id="reportClearHazards" class="button ghost" type="button">清空</button>
            </div>
          </div>
          <div class="assignment-number-grid">
            ${hazards.map((hazard, index) => `
              <label class="assignment-number-check" title="${escapeAttr(hazard.problem || "")}">
                <input class="gov-report-hazard-checkbox" type="checkbox" value="${escapeAttr(hazard.id)}" checked>
                <span>${index + 1}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="governance-bulk-actions">
          <p class="field-tip">批量应用时，仅非空字段会覆盖已选隐患；未填写的字段保持原值。</p>
          <button id="reportApplyBulkButton" class="button primary" type="button">批量应用到所选隐患</button>
        </div>
      </div>

      <div class="governance-assignment-list">
        ${hazards.map((hazard, index) => `
          <details class="governance-assignment-row" data-hazard-id="${escapeAttr(hazard.id)}">
            <summary>
              <label class="row-select" title="选择用于批量修改">
                <input class="gov-report-hazard-checkbox" type="checkbox" value="${escapeAttr(hazard.id)}" checked>
              </label>
              <div class="governance-hazard-title">
                <span>${index + 1}</span>
                <strong>${escapeHtml(hazard.problem || "未填写隐患")}</strong>
                <small>${escapeHtml(hazard.checkPlace || "未填写地点")}｜${escapeHtml(hazard.responsibleDept || "未分配")}｜${escapeHtml(hazard.deadline || "未填时限")}</small>
              </div>
            </summary>
            <div class="governance-assignment-grid">
              <label class="field"><span>督办领导</span><input class="input gov-report-assignment-input" data-hazard-id="${escapeAttr(hazard.id)}" data-field="supervisionLeader" list="reportLeaderList" value="${escapeAttr(hazard.supervisionLeader || "")}"></label>
              <label class="field"><span>治理责任单位或部门</span><input class="input gov-report-assignment-input" data-hazard-id="${escapeAttr(hazard.id)}" data-field="responsibleDept" list="reportDeptList" value="${escapeAttr(hazard.responsibleDept || "")}"></label>
              <label class="field"><span>治理责任人</span><input class="input gov-report-assignment-input" data-hazard-id="${escapeAttr(hazard.id)}" data-field="responsiblePerson" value="${escapeAttr(hazard.responsiblePerson || "")}"></label>
              <label class="field"><span>整改时限</span><input class="input gov-report-assignment-input" data-hazard-id="${escapeAttr(hazard.id)}" data-field="deadline" type="date" value="${escapeAttr(hazard.deadline || "")}"></label>
            </div>
          </details>
        `).join("")}
      </div>
      <datalist id="reportDeptList">${settings.responsibleDepts.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("")}</datalist>
      <datalist id="reportLeaderList">${settings.supervisionLeaders.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("")}</datalist>
    </section>
  `;
}

function bindGovernanceReportAssignmentEvents(content) {
  content.querySelectorAll(".gov-report-assignment-input").forEach((input) => {
    input.addEventListener("change", () => updateGovernanceReportAssignmentField(
      input.dataset.hazardId,
      input.dataset.field,
      input.value.trim()
    ));
  });
  content.querySelectorAll(".gov-report-hazard-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => syncGovernanceReportHazardSelection(checkbox.value, checkbox.checked, content));
  });
  content.querySelector("#reportSelectAllHazards")?.addEventListener("click", () => setGovernanceReportHazardSelection(true, content));
  content.querySelector("#reportClearHazards")?.addEventListener("click", () => setGovernanceReportHazardSelection(false, content));
  content.querySelector("#reportApplyBulkButton")?.addEventListener("click", applyGovernanceReportBulkUpdate);
}

function syncGovernanceReportHazardSelection(hazardId, checked, root = document) {
  root.querySelectorAll(".gov-report-hazard-checkbox").forEach((input) => {
    if (input.value === hazardId) input.checked = checked;
  });
}

function setGovernanceReportHazardSelection(checked, root = document) {
  root.querySelectorAll(".gov-report-hazard-checkbox").forEach((input) => {
    input.checked = checked;
  });
}

async function updateGovernanceReportAssignmentField(hazardId, field, value) {
  const allowed = ["supervisionLeader", "responsibleDept", "responsiblePerson", "deadline"];
  if (!hazardId || !allowed.includes(field)) return;
  governanceState.data.hazards = governanceState.data.hazards.map((hazard) => {
    if (hazard.id !== hazardId) return hazard;
    const updated = {
      ...hazard,
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    updated.autoStatus = computeGovernanceAutoStatus(updated);
    return updated;
  });
  await saveGovernanceData();
  showToast("责任信息已保存");
}

async function applyGovernanceReportBulkUpdate() {
  const selectedIds = new Set(Array.from(document.querySelectorAll(".gov-report-hazard-checkbox:checked")).map((input) => input.value));
  if (!selectedIds.size) {
    showToast("请先选择隐患编号");
    return;
  }
  const values = {
    supervisionLeader: document.querySelector("#reportBulkSupervisionLeader")?.value.trim() || "",
    responsibleDept: document.querySelector("#reportBulkResponsibleDept")?.value.trim() || "",
    responsiblePerson: document.querySelector("#reportBulkResponsiblePerson")?.value.trim() || "",
    deadline: document.querySelector("#reportBulkDeadline")?.value || ""
  };
  const activeEntries = Object.entries(values).filter(([, value]) => value);
  if (!activeEntries.length) {
    showToast("请至少填写一项批量内容");
    return;
  }
  governanceState.data.hazards = governanceState.data.hazards.map((hazard) => {
    if (!selectedIds.has(hazard.id)) return hazard;
    const updated = {
      ...hazard,
      ...Object.fromEntries(activeEntries),
      updatedAt: new Date().toISOString()
    };
    updated.autoStatus = computeGovernanceAutoStatus(updated);
    return updated;
  });
  await saveGovernanceData();
  showToast("批量修改成功");
  renderGovernanceActiveTab();
}

function renderGovernanceReportHazardOverview(hazards) {
  if (!hazards.length) {
    return `<p class="hint">该检查暂无隐患，无法生成治理表和整改报告。</p>`;
  }
  return `
    <div class="governance-table-wrap compact-report-table">
      <table class="governance-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>隐患编号</th>
            <th>问题隐患</th>
            <th>责任部门</th>
            <th>整改期限</th>
            <th>整改状态</th>
            <th>整改后照片</th>
          </tr>
        </thead>
        <tbody>
          ${hazards.map((hazard, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(hazard.hazardNo || "")}</td>
              <td class="table-problem">${escapeHtml(hazard.problem || "")}</td>
              <td>${escapeHtml(hazard.responsibleDept || "")}</td>
              <td>${escapeHtml(hazard.deadline || "")}</td>
              <td><span class="status-pill ${getGovernanceStatusClass(hazard.autoStatus)}">${escapeHtml(hazard.autoStatus)}</span></td>
              <td>${(hazard.afterPhotos || []).length} 张</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function exportGovernanceTableFromModule() {
  const task = buildGovernanceReportTask();
  if (!task) return;
  reportState.config.inspectionName = task.name;
  reportState.config.governanceNo = task.checkNo;
  reportState.config.checkedUnit = task.location;
  reportState.config.inspectionDateText = formatChineseDate(task.date);
  reportState.config.participants = task.leader || "";
  await exportGovernanceTable(task);
}

async function exportGovernanceWordReport(type) {
  const inspection = getSelectedGovernanceInspection();
  if (!inspection) {
    showToast("请先选择检查任务");
    return;
  }
  const reportMeta = getGovernanceReportTypeMeta(type);
  const allHazards = governanceState.data.hazards.filter((hazard) => hazard.checkNo === inspection.checkNo);
  const hazards = filterGovernanceReportHazards(allHazards, type);
  if (!allHazards.length) {
    showToast("该检查暂无隐患");
    return;
  }
  if (!hazards.length) {
    showToast(reportMeta.emptyText);
    return;
  }
  if (type === "delayIncluded" && !allHazards.some((item) => item.currentStatus === "延期整改")) {
    if (!window.confirm("当前检查没有延期整改隐患，是否仍继续生成含延期版报告？")) {
      return;
    }
  }
  if (["final", "delayIncluded", "delaySupplement"].includes(type)) {
    const checkHazards = hazards.filter((item) => item.currentStatus !== "延期整改");
    const missingText = checkHazards.filter((item) => !String(item.handlingMeasures || "").trim()).length;
    const missingPhotos = checkHazards.filter((item) => !(item.afterPhotos || []).length).length;
    if ((missingText || missingPhotos) && !window.confirm(`还有 ${missingText} 项未填写完成情况，${missingPhotos} 项未上传整改后照片。\n是否继续生成${reportMeta.name}？`)) {
      return;
    }
  }
  const includePhotos = document.querySelector("#govReportPhotos").checked;
  const d = window.docx;
  const title = document.querySelector("#govReportTitle").value.trim() || `关于落实${inspection.checkName}意见的情况报告`;
  const recipient = document.querySelector("#govRecipient").value.trim() || "安防环保部";
  const reportCompany = document.querySelector("#govReportCompany").value.trim() || "锦原铀业有限公司";
  const children = [
    reportTitleParagraph(d, title),
    reportRecipientParagraph(d, recipient),
    reportParagraph(d, buildGovernanceReportIntro(inspection, hazards, type)),
    reportLevelOneParagraph(d, "一、问题隐患及整治情况")
  ];
  for (let index = 0; index < hazards.length; index += 1) {
    const hazard = hazards[index];
    children.push(reportHazardTitleParagraph(d, `${index + 1}. ${ensureChinesePeriod(hazard.problem)}`));
    children.push(reportLabeledParagraph(d, "整改措施：", ensureChinesePeriod(hazard.rectificationMeasures)));
    const completion = type === "initial"
      ? "已完成整改，已按要求落实整改措施。"
      : buildGovernanceCompletionText(hazard);
    children.push(reportLabeledParagraph(d, "完成情况：", completion));
    if (includePhotos && hazard.currentStatus !== "延期整改") {
      const before = hazard.beforePhotoMain ? hazard.beforePhotos.filter((photo) => photo.id === hazard.beforePhotoMain) : hazard.beforePhotos.slice(0, 1);
      const after = type === "initial" ? [] : (hazard.afterPhotoMain ? hazard.afterPhotos.filter((photo) => photo.id === hazard.afterPhotoMain) : hazard.afterPhotos.slice(0, 1));
      children.push(await buildPhotoTable(before, after));
    }
  }
  children.push(reportSignatureParagraph(d, reportCompany, 360));
  children.push(reportSignatureParagraph(d, formatChineseDate(getTodayDate())));
  const doc = buildReportDocument(d, children, { headerCompanyName: reportCompany });
  const blob = await d.Packer.toBlob(doc);
  downloadBlob(`${inspection.checkNo}-${safeFilePart(title)}-${reportMeta.suffix}.docx`, blob);
  showToast("整改报告已导出");
}

function getGovernanceReportTypeMeta(type) {
  const metas = {
    initial: { name: "初版整改报告", suffix: "初版", emptyText: "该检查暂无隐患" },
    final: { name: "终版整改报告", suffix: "终版", emptyText: "该检查暂无隐患" },
    delayIncluded: { name: "含延期版报告", suffix: "含延期版", emptyText: "该检查暂无隐患" },
    delaySupplement: { name: "延期补充报告", suffix: "延期补充版", emptyText: "没有曾延期且已整改的隐患，暂不能生成延期补充报告" }
  };
  return metas[type] || metas.final;
}

function filterGovernanceReportHazards(hazards, type) {
  if (type === "delaySupplement") {
    return hazards.filter(isGovernanceDelayedCompletedHazard);
  }
  return hazards;
}

function isGovernanceDelayedCompletedHazard(hazard) {
  return hazard.currentStatus === "已整改" && Boolean(hazard.extensionReason || hazard.extensionDeadline);
}

function buildGovernanceReportIntro(inspection, hazards, type) {
  const dateText = formatChineseDate(inspection.checkDate);
  const leadDept = inspection.leadDept || "检查组";
  const place = inspection.checkPlace || "相关区域";
  const name = inspection.checkName || "安全检查";
  if (type === "delaySupplement") {
    return `${dateText}，${leadDept}对${place}开展了${name}。前期延期整改的${hazards.length}项问题隐患已完成整改，现将补充整改情况上报如下：`;
  }
  if (type === "delayIncluded") {
    return `${dateText}，${leadDept}对${place}开展了${name}，共发现${hazards.length}项问题隐患。锦原铀业组织研究制定问题整改措施，明确整改责任人和整改措施，要求限期完成整改。经检查确认，已完成整改的隐患按要求闭环，延期整改隐患已明确延期原因和后续整改期限，现将整改情况上报如下：`;
  }
  return `${dateText}，${leadDept}对${place}开展了${name}，共发现${hazards.length}项问题隐患。锦原铀业组织研究制定问题整改措施，明确整改责任人和整改措施，要求限期完成整改。经检查确认，现将整改完成情况上报如下：`;
}

function renderGovernanceScriptsPage(content) {
  const inspection = getSelectedGovernanceInspection();
  const hazards = inspection ? governanceState.data.hazards.filter((item) => item.checkNo === inspection.checkNo) : governanceState.data.hazards;
  const depts = [...new Set(hazards.map((item) => item.responsibleDept).filter(Boolean))];
  const scripts = buildGovernanceScripts(inspection, hazards, depts);
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title"><h2>任务下发话术</h2><p class="hint">生成后可以一键复制到微信、邮件或通知中。</p></div>
      <label class="field"><span>检查任务</span><select id="scriptInspectionId" class="select">${governanceState.data.inspections.map((item) => `<option value="${item.id}" ${item.id === governanceState.selectedInspectionId ? "selected" : ""}>${escapeHtml(item.checkNo)} ${escapeHtml(item.checkName)}</option>`).join("")}</select></label>
    </section>
    <div class="script-list">
      ${scripts.map((item, index) => `
        <section class="tool-card glass script-card">
          <div class="section-title"><h3>${escapeHtml(item.title)}</h3><button class="button" type="button" data-copy-script="${index}">复制</button></div>
          <pre>${escapeHtml(item.text)}</pre>
        </section>
      `).join("")}
    </div>
  `;
  content.querySelector("#scriptInspectionId").addEventListener("change", (event) => {
    governanceState.selectedInspectionId = event.target.value;
    renderGovernanceActiveTab();
  });
  content.querySelectorAll("[data-copy-script]").forEach((button) => {
    button.addEventListener("click", () => copyText(scripts[Number(button.dataset.copyScript)].text).then(() => showToast("已复制")));
  });
}

function renderGovernanceSettingsPage(content) {
  const settings = governanceState.data.settings;
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title"><h2>基础设置</h2><p class="hint">每行或逗号分隔均可，保存后立即用于表单和筛选。</p></div>
      <form id="governanceSettingsForm" class="form-grid">
        <label class="field"><span>责任部门</span><textarea id="setResponsibleDepts" class="textarea small-textarea">${escapeHtml(settings.responsibleDepts.join("\n"))}</textarea></label>
        <label class="field"><span>督办领导</span><textarea id="setLeaders" class="textarea small-textarea">${escapeHtml(settings.supervisionLeaders.join("\n"))}</textarea></label>
        <label class="field"><span>验收人</span><textarea id="setAcceptors" class="textarea small-textarea">${escapeHtml(settings.acceptors.join("\n"))}</textarea></label>
        <label class="field"><span>报告落款公司</span><textarea id="setReportCompanies" class="textarea small-textarea">${escapeHtml(settings.reportCompanies.join("\n"))}</textarea></label>
        <label class="field span-2"><span>隐患类型与专业类型</span><textarea id="setHazardTypes" class="textarea" placeholder="安全管理:制度台账,教育培训">${escapeHtml(Object.entries(settings.hazardTypes).map(([key, values]) => `${key}:${values.join(",")}`).join("\n"))}</textarea></label>
        <div class="actions span-2"><button class="button primary" type="submit">保存基础设置</button></div>
      </form>
    </section>
  `;
  content.querySelector("#governanceSettingsForm").addEventListener("submit", saveGovernanceSettingsFromForm);
}

async function saveGovernanceSettingsFromForm(event) {
  event.preventDefault();
  governanceState.data.settings = {
    ...governanceState.data.settings,
    responsibleDepts: splitSettingList(document.querySelector("#setResponsibleDepts").value),
    supervisionLeaders: splitSettingList(document.querySelector("#setLeaders").value),
    acceptors: splitSettingList(document.querySelector("#setAcceptors").value),
    reportCompanies: splitSettingList(document.querySelector("#setReportCompanies").value),
    hazardTypes: parseHazardTypeSettings(document.querySelector("#setHazardTypes").value)
  };
  await saveGovernanceData();
  showToast("基础设置已保存");
  renderGovernanceActiveTab();
}

function renderGovernanceBackupPage(content) {
  content.innerHTML = `
    <section class="tool-card glass">
      <div class="section-title"><h2>数据备份与恢复</h2><p class="hint">离线电脑和在线版不会自动同步，请用 JSON 文件流转。</p></div>
      <div class="actions">
        <button id="exportGovAllButton" class="button primary" type="button">导出全量数据备份 JSON</button>
        <button id="importGovAllButton" class="button" type="button">导入全量数据备份 JSON</button>
        <button id="importGovInspectionJsonButton" class="button" type="button">导入检查数据 JSON</button>
        <input id="govAllJsonInput" class="hidden" type="file" accept="application/json,.json">
        <input id="govInspectionJsonInput" class="hidden" type="file" accept="application/json,.json">
      </div>
    </section>
  `;
  content.querySelector("#exportGovAllButton").addEventListener("click", () => {
    downloadTextFile(`隐患排查治理全量备份-${formatDateForFile(new Date())}.json`, JSON.stringify(governanceState.data, null, 2), "application/json;charset=utf-8");
    showToast("全量数据已导出");
  });
  content.querySelector("#importGovAllButton").addEventListener("click", () => content.querySelector("#govAllJsonInput").click());
  content.querySelector("#importGovInspectionJsonButton").addEventListener("click", () => content.querySelector("#govInspectionJsonInput").click());
  content.querySelector("#govAllJsonInput").addEventListener("change", importGovernanceFullBackup);
  content.querySelector("#govInspectionJsonInput").addEventListener("change", importGovernanceInspectionJson);
}

async function importGovernanceFullBackup(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    const data = normalizeGovernanceData(await readJsonFile(file));
    if (!window.confirm(`将导入 ${data.inspections.length} 项检查、${data.hazards.length} 条隐患，是否覆盖当前治理台账？`)) return;
    governanceState.data = data;
    await saveGovernanceData();
    showToast("全量数据已恢复");
    renderHazardGovernanceModule();
  } catch (error) {
    showToast("导入失败，请检查文件格式");
  }
}

async function importGovernanceInspectionJson(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    const data = await readJsonFile(file);
    const result = importInspectionJsonIntoGovernanceData(governanceState.data, data);
    if (!window.confirm(`将导入检查 ${result.inspection.checkNo}，共 ${result.hazardCount} 条隐患，是否继续？`)) return;
    await saveGovernanceData();
    showToast("检查数据已导入");
    renderHazardGovernanceModule();
  } catch (error) {
    showToast(error.message || "检查数据导入失败");
  }
}

async function importGovernanceTableExcel(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  try {
    if (!window.XLSX) {
      throw new Error("Excel 组件未加载，请刷新页面后重试");
    }
    const parsed = await parseGovernanceTableExcelFile(file);
    const sameInspection = governanceState.data.inspections.find((item) => (
      item.checkNo === parsed.inspection.checkNo ||
      (item.checkName === parsed.inspection.checkName &&
        item.checkDate === parsed.inspection.checkDate &&
        item.checkPlace === parsed.inspection.checkPlace)
    ));

    if (sameInspection) {
      const overwrite = window.confirm(`已存在相同检查：${sameInspection.checkNo} ${sameInspection.checkName}\n\n确定：覆盖该检查及其隐患\n取消：停止导入`);
      if (!overwrite) return;
      parsed.inspection.id = sameInspection.id;
      parsed.inspection.checkNo = sameInspection.checkNo;
      governanceState.data.inspections = governanceState.data.inspections.filter((item) => item.id !== sameInspection.id);
      governanceState.data.hazards = governanceState.data.hazards.filter((item) => item.checkNo !== sameInspection.checkNo);
    } else if (!window.confirm(`即将导入检查：${parsed.inspection.checkNo} ${parsed.inspection.checkName}\n共 ${parsed.hazards.length} 条隐患，是否继续？`)) {
      return;
    }

    parsed.hazards = parsed.hazards.map((hazard, index) => ({
      ...hazard,
      checkNo: parsed.inspection.checkNo,
      checkType: parsed.inspection.checkType,
      checkDate: parsed.inspection.checkDate,
      checkPlace: parsed.inspection.checkPlace,
      hazardNo: `${parsed.inspection.checkNo}-${String(index + 1).padStart(3, "0")}`
    }));
    parsed.inspection.hazardCount = parsed.hazards.length;
    parsed.inspection.folderName = buildInspectionFolderName(parsed.inspection);

    governanceState.data.inspections.unshift(parsed.inspection);
    governanceState.data.hazards.push(...parsed.hazards);
    mergeGovernanceSettingsFromHazards(parsed.hazards);
    governanceState.selectedInspectionId = parsed.inspection.id;
    governanceState.activeTab = "ledger";
    await saveGovernanceData();
    showToast(`已导入 ${parsed.hazards.length} 条隐患`);
    renderHazardGovernanceModule();
  } catch (error) {
    showToast(error.message || "隐患治理表导入失败");
  }
}

function parseGovernanceTableExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = window.XLSX.read(reader.result, { type: "array", cellDates: true });
        resolve(parseGovernanceTableWorkbook(workbook, file.name));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function parseGovernanceTableWorkbook(workbook, fileName = "隐患治理表.xlsx") {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("未找到工作表");
  }
  const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
  const headerIndex = findGovernanceTableHeaderIndex(rows);
  if (headerIndex < 0) {
    throw new Error("未找到隐患治理表表头，请检查是否为标准治理表");
  }

  const headerMap = buildGovernanceTableHeaderMap(rows[headerIndex]);
  const meta = parseGovernanceTableMeta(rows.slice(0, headerIndex), fileName);
  const now = new Date().toISOString();
  const checkTypeCode = inferGovernanceTableTypeCode(meta);
  const checkNo = isStandardGovernanceCheckNo(meta.serialNo)
    ? meta.serialNo
    : generateGovernanceCheckNo(checkTypeCode, meta.checkDate || getTodayDate());
  const inspection = normalizeGovernanceInspection({
    id: createId(),
    checkNo,
    checkTypeCode,
    checkType: checkTypeNameFromCode(checkTypeCode),
    checkName: meta.checkName,
    checkDate: meta.checkDate || getTodayDate(),
    checkPlace: meta.checkedUnit || "未填写被检查单位",
    leadDept: meta.leadDept,
    groupLeader: meta.participants,
    remark: `由隐患治理表导入：${fileName}`,
    createdAt: now,
    updatedAt: now
  });

  const hazards = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const problem = getGovernanceTableCell(row, headerMap.problem);
    const rowText = row.map(governanceCellToText).join("");
    if (!problem) {
      if (/单位负责人|分管负责人|部门负责人|制表人|安防环保部/.test(rowText)) break;
      continue;
    }
    if (/隐患名称|拟采取的治理措施/.test(problem)) continue;

    const handlingMeasures = getGovernanceTableCell(row, headerMap.handlingMeasures);
    const currentStatus = inferGovernanceStatusFromHandling(handlingMeasures);
    const hazard = normalizeGovernanceHazard({
      id: createId(),
      checkNo: inspection.checkNo,
      hazardNo: `${inspection.checkNo}-${String(hazards.length + 1).padStart(3, "0")}`,
      checkType: inspection.checkType,
      checkDate: inspection.checkDate,
      checkPlace: inspection.checkPlace,
      hazardLevel: normalizeGovernanceHazardLevel(getGovernanceTableCell(row, headerMap.level)),
      hazardType: "",
      professionalType: "",
      problem,
      rectificationMeasures: getGovernanceTableCell(row, headerMap.measure),
      supervisionLeader: getGovernanceTableCell(row, headerMap.supervisionLeader),
      responsibleDept: getGovernanceTableCell(row, headerMap.responsibleDept),
      responsiblePerson: getGovernanceTableCell(row, headerMap.responsiblePerson),
      deadline: parseGovernanceDateInput(row[headerMap.deadline]),
      acceptor: getGovernanceTableCell(row, headerMap.acceptor),
      handlingMeasures,
      currentStatus,
      platformCloseStatus: "未上传",
      feedbackSource: "隐患治理表导入",
      createdAt: now,
      updatedAt: now
    });
    hazards.push(hazard);
  }

  if (!hazards.length) {
    throw new Error("未读取到隐患明细");
  }
  inspection.hazardCount = hazards.length;
  inspection.folderName = buildInspectionFolderName(inspection);
  return { inspection, hazards };
}

function findGovernanceTableHeaderIndex(rows) {
  return rows.findIndex((row) => {
    const text = (row || []).map(governanceCellToText).join("|");
    return text.includes("隐患名称") && (text.includes("拟采取") || text.includes("治理措施"));
  });
}

function buildGovernanceTableHeaderMap(row) {
  const headers = (row || []).map(governanceCellToText);
  const find = (...patterns) => {
    const index = headers.findIndex((text) => patterns.some((pattern) => text.includes(pattern)));
    return index >= 0 ? index : -1;
  };
  return {
    problem: find("隐患名称", "问题隐患", "隐患内容"),
    level: find("隐患等级"),
    measure: find("拟采取", "整改措施", "治理措施"),
    supervisionLeader: find("督办领导"),
    responsibleDept: find("治理责任单位", "责任单位", "责任部门"),
    responsiblePerson: find("治理责任人", "责任人"),
    deadline: find("治理时间", "整改期限", "治理期限"),
    acceptor: find("整治完成验收人", "验收人"),
    handlingMeasures: find("处理措施", "完成情况")
  };
}

function parseGovernanceTableMeta(rows, fileName) {
  const cells = rows.flatMap((row) => row.map(governanceCellToText).filter(Boolean));
  const findValue = (label) => {
    const cell = cells.find((item) => item.includes(label));
    return cell ? cell.split(/[:：]/).slice(1).join("：").trim() : "";
  };
  const title = cells.find((item) => item.includes("隐患治理表")) || fileName.replace(/\.(xlsx|xls)$/i, "");
  return {
    serialNo: findValue("序号").replace(/\s+/g, ""),
    checkName: title.replace(/隐患治理表/g, "").trim() || fileName.replace(/\.(xlsx|xls)$/i, ""),
    checkedUnit: findValue("被检查单位"),
    checkDate: parseGovernanceDateInput(findValue("检查时间")),
    participants: findValue("参检人员"),
    leadDept: ""
  };
}

function getGovernanceTableCell(row, index) {
  if (index == null || index < 0) return "";
  return governanceCellToText(row[index]);
}

function governanceCellToText(value) {
  if (value == null) return "";
  if (value instanceof Date) return formatDateInputFromDate(value);
  if (typeof value === "object") {
    if (value.text) return String(value.text).trim();
    if (value.result != null) return governanceCellToText(value.result);
    if (Array.isArray(value.richText)) return value.richText.map((item) => item.text || "").join("").trim();
  }
  return String(value).replace(/^"|"$/g, "").replace(/\s+/g, " ").trim();
}

function parseGovernanceDateInput(value) {
  if (!value) return "";
  if (value instanceof Date) return formatDateInputFromDate(value);
  if (typeof value === "number" && window.XLSX?.SSF?.parse_date_code) {
    const parsed = window.XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const text = governanceCellToText(value);
  let match = text.match(/(\d{4})[年\\/-](\d{1,2})[月\\/-](\d{1,2})/);
  if (match) return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
  match = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
  match = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
  return "";
}

function formatDateInputFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isStandardGovernanceCheckNo(value) {
  return /^ZHJYAF\d{4}-(NB|SJ|WB)-\d{2}$/.test(String(value || ""));
}

function inferGovernanceTableTypeCode(meta) {
  const text = `${meta.checkName || ""}${meta.serialNo || ""}`;
  if (/外部|政府|生态环境|应急管理/.test(text)) return "WB";
  if (/上级|中核|铀业|集团|四不两直/.test(text)) return "SJ";
  return "NB";
}

function normalizeGovernanceHazardLevel(value) {
  const text = String(value || "").trim();
  if (!text) return "一般隐患";
  if (text.includes("重大")) return "重大隐患";
  if (text.includes("一般")) return "一般隐患";
  return text.endsWith("隐患") ? text : `${text}隐患`;
}

function inferGovernanceStatusFromHandling(handlingMeasures) {
  const text = String(handlingMeasures || "").trim();
  if (!text) return "整改中";
  if (text.includes("延期")) return "延期整改";
  return "已整改";
}

function mergeGovernanceSettingsFromHazards(hazards) {
  const pushUnique = (key, values) => {
    governanceState.data.settings[key] = [...new Set([
      ...(governanceState.data.settings[key] || []),
      ...values.filter(Boolean)
    ])];
  };
  pushUnique("responsibleDepts", hazards.map((item) => item.responsibleDept));
  pushUnique("supervisionLeaders", hazards.map((item) => item.supervisionLeader));
  pushUnique("acceptors", hazards.map((item) => item.acceptor));
}

function buildGovernanceReportTask() {
  const inspection = getSelectedGovernanceInspection();
  if (!inspection) {
    showToast("请先选择检查任务");
    return null;
  }
  return {
    id: inspection.id,
    checkNo: inspection.checkNo,
    name: inspection.checkName,
    date: inspection.checkDate,
    location: inspection.checkPlace,
    leader: inspection.groupLeader,
    inspectionInfo: { date: inspection.checkDate, location: inspection.checkPlace, leader: inspection.groupLeader },
    hazards: governanceState.data.hazards.filter((hazard) => hazard.checkNo === inspection.checkNo).map((hazard) => ({
      id: hazard.id,
      code: hazard.hazardNo,
      problem: hazard.problem,
      level: hazard.hazardLevel?.replace("隐患", "") || "一般",
      measure: hazard.rectificationMeasures,
      supervisingLeader: hazard.supervisionLeader,
      responsibleUnit: hazard.responsibleDept,
      responsiblePerson: hazard.responsiblePerson,
      deadline: hazard.deadline,
      photos: hazard.beforePhotos,
      inspectionInfo: { date: hazard.checkDate, location: hazard.checkPlace, leader: inspection.groupLeader }
    }))
  };
}

function getSelectedGovernanceInspection() {
  return governanceState.data.inspections.find((item) => item.id === governanceState.selectedInspectionId)
    || governanceState.data.inspections[0]
    || null;
}

function getFilteredGovernanceHazards() {
  const keyword = governanceState.ledgerKeyword.toLowerCase();
  return governanceState.data.hazards.filter((hazard) => {
    const filters = governanceState.ledgerFilters;
    if (filters.checkTypeCode && checkTypeCodeFromName(hazard.checkType) !== filters.checkTypeCode) return false;
    if (filters.checkNo && hazard.checkNo !== filters.checkNo) return false;
    if (filters.responsibleDept && hazard.responsibleDept !== filters.responsibleDept) return false;
    if (filters.currentStatus && hazard.currentStatus !== filters.currentStatus) return false;
    if (filters.autoStatus && hazard.autoStatus !== filters.autoStatus) return false;
    if (filters.platformCloseStatus && hazard.platformCloseStatus !== filters.platformCloseStatus) return false;
    if (filters.hazardLevel && hazard.hazardLevel !== filters.hazardLevel) return false;
    if (filters.hazardType && hazard.hazardType !== filters.hazardType) return false;
    if (filters.professionalType && hazard.professionalType !== filters.professionalType) return false;
    if (keyword && !`${hazard.problem}\n${hazard.rectificationMeasures}\n${hazard.responsibleDept}\n${hazard.responsiblePerson}`.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

function openGovernanceLedgerByMetric(metric) {
  governanceState.ledgerFilters = { checkTypeCode: "", checkNo: "", responsibleDept: "", currentStatus: "", autoStatus: "", platformCloseStatus: "", hazardLevel: "", hazardType: "", professionalType: "" };
  governanceState.ledgerKeyword = "";
  if (metric === "done") governanceState.ledgerFilters.autoStatus = "已整改";
  if (metric === "unfinished") governanceState.ledgerFilters.autoStatus = "整改中";
  if (metric === "overdue") governanceState.ledgerFilters.autoStatus = "已逾期";
  if (metric === "notClosed") governanceState.ledgerFilters.platformCloseStatus = "未上传";
  if (metric === "inspection") governanceState.activeTab = "inspection";
  else governanceState.activeTab = "ledger";
  governanceState.workflowFocus = metric === "inspection" ? "inspection" : "ledger";
  renderHazardGovernanceModule();
}

function getGovernanceStats(hazards) {
  return {
    total: hazards.length,
    done: hazards.filter((item) => item.autoStatus === "已整改").length,
    unfinished: hazards.filter((item) => item.autoStatus !== "已整改").length,
    overdue: hazards.filter((item) => item.autoStatus === "已逾期").length,
    due3: hazards.filter((item) => isDueWithinDays(item.deadline, 3) && item.autoStatus !== "已整改").length,
    due7: hazards.filter((item) => isDueWithinDays(item.deadline, 7) && item.autoStatus !== "已整改").length,
    notClosed: hazards.filter((item) => item.platformCloseStatus !== "已上传闭环").length
  };
}

function computeGovernanceAutoStatus(hazard) {
  if (hazard.currentStatus === "已整改") return "已整改";
  if (hazard.currentStatus === "延期整改") return "延期整改";
  if (hazard.deadline && new Date(`${hazard.deadline}T23:59:59`).getTime() < Date.now()) return "已逾期";
  return "整改中";
}

function isDueWithinDays(dateText, days) {
  if (!dateText) return false;
  const diff = new Date(`${dateText}T23:59:59`).getTime() - Date.now();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function groupHazardsBy(hazards, field) {
  return hazards.reduce((acc, hazard) => {
    const key = hazard[field] || "未填写";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function checkTypeNameFromCode(code) {
  return governanceState.data?.settings?.checkTypes?.find((item) => item.code === code)?.name
    || createDefaultGovernanceSettings().checkTypes.find((item) => item.code === code)?.name
    || "公司检查";
}

function checkTypeCodeFromName(name) {
  return governanceState.data?.settings?.checkTypes?.find((item) => item.name === name)?.code
    || createDefaultGovernanceSettings().checkTypes.find((item) => item.name === name)?.code
    || "NB";
}

function generateGovernanceCheckNo(typeCode = "NB", dateText = getTodayDate()) {
  const year = String(dateText || getTodayDate()).slice(0, 4);
  const prefix = `ZHJYAF${year}-${typeCode}-`;
  const max = governanceState.data.inspections.reduce((value, item) => {
    const match = String(item.checkNo || "").match(new RegExp(`^${prefix}(\\d{2})$`));
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

function previewNextGovernanceCheckNo(typeCode = "NB", dateText = getTodayDate()) {
  return generateGovernanceCheckNo(typeCode, dateText);
}

function generateGovernanceHazardNo(checkNo) {
  const max = governanceState.data.hazards.reduce((value, item) => {
    const match = String(item.hazardNo || "").match(new RegExp(`^${checkNo}-(\\d{3})$`));
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return `${checkNo}-${String(max + 1).padStart(3, "0")}`;
}

function previewNextGovernanceHazardNo(checkNo) {
  return generateGovernanceHazardNo(checkNo);
}

function buildInspectionFolderName(inspection) {
  return `${inspection.checkNo || ""} ${inspection.checkName || ""} ${inspection.hazardCount || 0}条隐患`.trim();
}

async function syncCaptureDataToGovernance() {
  const captureData = await loadHazardData();
  if (!captureData.hazards.length) {
    showToast("隐患采集工具暂无可同步数据");
    return;
  }
  const before = governanceState.data.hazards.length;
  importCaptureDataIntoGovernanceData(governanceState.data, captureData);
  await saveGovernanceData();
  showToast(`已同步 ${governanceState.data.hazards.length - before} 条采集隐患`);
  renderHazardGovernanceModule();
}

function importCaptureDataIntoGovernanceData(targetData, captureData) {
  const groups = new Map();
  normalizeHazardData(captureData).hazards.forEach((hazard) => {
    const info = getHazardInspectionInfo(hazard, captureData.inspectionInfo);
    const key = `${info.date}|${info.location}|${info.leader}`;
    if (!groups.has(key)) groups.set(key, { info, hazards: [] });
    groups.get(key).hazards.push(hazard);
  });
  groups.forEach((group) => {
    let inspection = targetData.inspections.find((item) => item.checkDate === group.info.date && item.checkPlace === group.info.location && item.groupLeader === group.info.leader);
    if (!inspection) {
      const tempState = governanceState.data;
      governanceState.data = targetData;
      const checkNo = generateGovernanceCheckNo("NB", group.info.date);
      governanceState.data = tempState;
      inspection = normalizeGovernanceInspection({
        checkNo,
        checkType: "公司检查",
        checkTypeCode: "NB",
        checkName: `${group.info.location || "现场"}安全检查`,
        checkDate: group.info.date,
        checkPlace: group.info.location,
        groupLeader: group.info.leader
      });
      targetData.inspections.push(inspection);
    }
    group.hazards.forEach((source) => {
      if (targetData.hazards.some((item) => item.id === source.id || item.problem === source.problem && item.checkNo === inspection.checkNo)) return;
      const number = targetData.hazards.filter((item) => item.checkNo === inspection.checkNo).length + 1;
      targetData.hazards.push(normalizeGovernanceHazard({
        id: source.id,
        checkNo: inspection.checkNo,
        hazardNo: `${inspection.checkNo}-${String(number).padStart(3, "0")}`,
        checkType: inspection.checkType,
        checkDate: inspection.checkDate,
        checkPlace: inspection.checkPlace,
        problem: source.problem,
        rectificationMeasures: source.measure,
        responsibleDept: source.responsibleUnit,
        responsiblePerson: source.responsiblePerson,
        supervisionLeader: source.supervisingLeader,
        deadline: source.deadline,
        beforePhotos: source.photos,
        feedbackSource: "手机端检查采集",
        createdAt: source.createTime
      }));
    });
  });
}

function importInspectionJsonIntoGovernanceData(targetData, data) {
  if (data.schemaVersion !== "hazard-inspection-v1" && !isValidHazardData(data)) {
    throw new Error("检查数据 JSON 格式不正确");
  }
  const inspectionSource = data.inspection || data.inspectionInfo || {};
  const typeCode = inspectionSource.checkTypeCode || checkTypeCodeFromName(inspectionSource.checkType || "公司检查");
  const inspection = normalizeGovernanceInspection({
    ...inspectionSource,
    checkNo: inspectionSource.checkNo || generateGovernanceCheckNo(typeCode, inspectionSource.checkDate || inspectionSource.date || getTodayDate()),
    checkTypeCode: typeCode,
    checkType: inspectionSource.checkType || checkTypeNameFromCode(typeCode),
    checkName: inspectionSource.checkName || inspectionSource.inspectionName || `${inspectionSource.checkPlace || inspectionSource.location || "现场"}安全检查`,
    checkDate: inspectionSource.checkDate || inspectionSource.date || getTodayDate(),
    checkPlace: inspectionSource.checkPlace || inspectionSource.location || "",
    groupLeader: inspectionSource.groupLeader || inspectionSource.leader || ""
  });
  const oldIndex = targetData.inspections.findIndex((item) => item.checkNo === inspection.checkNo);
  if (oldIndex >= 0) targetData.inspections[oldIndex] = inspection;
  else targetData.inspections.push(inspection);
  const hazards = Array.isArray(data.hazards) ? data.hazards : [];
  hazards.forEach((source, index) => {
    const hazardNo = source.hazardNo || `${inspection.checkNo}-${String(index + 1).padStart(3, "0")}`;
    if (targetData.hazards.some((item) => item.hazardNo === hazardNo)) return;
    targetData.hazards.push(normalizeGovernanceHazard({
      ...source,
      checkNo: inspection.checkNo,
      hazardNo,
      checkType: inspection.checkType,
      checkDate: inspection.checkDate,
      checkPlace: inspection.checkPlace,
      rectificationMeasures: source.rectificationMeasures || source.measure,
      beforePhotos: source.beforePhotos || source.photos
    }));
  });
  return { inspection, hazardCount: hazards.length };
}

function exportGovernanceLedger(rows, fileName) {
  const fields = getSelectedGovernanceLedgerFields("export");
  const data = rows.map((hazard, index) => {
    const row = {};
    fields.forEach((field) => {
      row[field.label] = getGovernanceLedgerFieldValue(field, hazard, index);
    });
    return row;
  });
  if (!data.length) {
    showToast("没有可导出的数据");
    return;
  }
  const sheet = window.XLSX.utils.json_to_sheet(data);
  const book = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(book, sheet, "隐患台账");
  const output = window.XLSX.write(book, { bookType: "xlsx", type: "array" });
  downloadBlob(fileName, new Blob([output], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  showToast("台账已导出");
}

function buildGovernanceCompletionText(hazard) {
  if (hazard.currentStatus === "延期整改") {
    return ensureChinesePeriod(`该项隐患因${hazard.extensionReason || "客观原因"}暂未完成整改，计划延期至${formatChineseDate(hazard.extensionDeadline || hazard.deadline)}前完成整改，后续将持续跟踪整改进展`);
  }
  return ensureChinesePeriod(hazard.handlingMeasures || "已完成整改，已按要求落实整改措施");
}

function buildGovernanceScripts(inspection, hazards, depts) {
  const checkName = inspection?.checkName || "本次检查";
  const scripts = [{
    title: "总体下发话术",
    text: `【隐患整改任务提醒】\n各相关责任部门：\n根据【${checkName}】检查情况，现将涉及你部门的问题隐患下发整改。请按照隐患治理要求，逐项落实整改措施，并于整改期限前反馈整改完成情况及整改后照片。\n本次隐患共${hazards.length}项，请高度重视，按期完成整改，避免逾期。`
  }];
  depts.forEach((dept) => {
    const deptHazards = hazards.filter((item) => item.responsibleDept === dept);
    scripts.push({
      title: `${dept}任务话术`,
      text: `【${dept}】：\n你部门涉及【${checkName}】隐患整改任务共${deptHazards.length}项，具体隐患如下：\n${deptHazards.map((hazard, index) => `${index + 1}.【${hazard.hazardNo}】问题隐患：${hazard.problem}；整改期限：${hazard.deadline || "未填写"}。`).join("\n")}\n请按要求完成整改，并通过手机端导出整改反馈 JSON 后反馈。`
    });
  });
  const overdue = hazards.filter((item) => item.autoStatus === "已逾期");
  if (overdue.length) {
    scripts.push({ title: "逾期催办话术", text: `【逾期隐患催办提醒】\n相关责任部门：\n仍有${overdue.length}项隐患已超过整改期限，涉及检查：【${checkName}】。请立即组织整改，并反馈整改完成情况、处理措施及整改后照片。` });
  }
  const due3 = hazards.filter((item) => isDueWithinDays(item.deadline, 3) && item.autoStatus !== "已整改");
  scripts.push({ title: "即将到期提醒话术", text: `【整改到期提醒】\n相关责任部门：\n有${due3.length}项隐患将在3天内到期，请提前安排整改，按期反馈整改情况，避免逾期。` });
  return scripts;
}

function splitSettingList(text) {
  return String(text || "").split(/[\n,，、]+/).map((item) => item.trim()).filter(Boolean);
}

function parseHazardTypeSettings(text) {
  const output = {};
  String(text || "").split(/\n+/).forEach((line) => {
    const [name, values = ""] = line.split(/[:：]/);
    if (name?.trim()) output[name.trim()] = splitSettingList(values);
  });
  return Object.keys(output).length ? output : createDefaultGovernanceSettings().hazardTypes;
}

async function renderHazardCheckTool() {
  app.innerHTML = `<section class="tool-card glass"><h2>安全检查隐患采集</h2><p class="hint">正在读取本地数据...</p></section>`;
  hazardState.data = await loadHazardData();
  hazardState.draftPhotos = [];
  hazardState.editingId = null;
  hazardState.previewHazardId = null;
  hazardState.mergeDraft = null;

  app.innerHTML = `
    <div class="tool-layout hazard-tool">
      <section class="tool-card glass">
        <div class="section-title">
          <div>
            <h2>安全检查隐患采集</h2>
            <p class="hint">先保存检查信息，再快速录入隐患、照片和整改措施。</p>
          </div>
        </div>

        <form id="inspectionForm" class="form-grid compact-form">
          <label class="field">
            <span>检查时间</span>
            <input id="inspectionDate" class="input" type="date" value="${escapeAttr(hazardState.data.inspectionInfo.date || getTodayDate())}">
          </label>
          <label class="field">
            <span>检查地点</span>
            <input id="inspectionLocation" class="input" type="text" value="${escapeAttr(hazardState.data.inspectionInfo.location)}" placeholder="例如：井下0米中段">
          </label>
          <label class="field">
            <span>检查组组长</span>
            <input id="inspectionLeader" class="input" type="text" value="${escapeAttr(hazardState.data.inspectionInfo.leader)}" placeholder="例如：张三">
          </label>
          <div class="actions">
            <button class="button primary" type="submit">保存检查信息</button>
            <button id="clearHazardButton" class="button danger" type="button">清空本次检查</button>
          </div>
        </form>
      </section>

      <section id="hazardEditorPanel" class="tool-card glass ${isInspectionReady() ? "" : "disabled-panel"}">
        <div class="section-title">
          <div>
            <h2>隐患录入</h2>
            <p class="hint">${isInspectionReady() ? "每条隐患必填：问题隐患、整改措施、问题照片。" : "请先保存检查时间、地点和组长。"}</p>
          </div>
          <span id="hazardCodeBadge" class="code-badge">${getCurrentHazardCode()}</span>
        </div>

        <form id="hazardForm" class="form-grid">
          <label class="field">
            <span>问题隐患</span>
            <textarea id="hazardProblem" class="textarea" placeholder="例如：井下0米中段9-14采场局部顶板浮石未及时处理。"></textarea>
          </label>
          <button class="button voice-button" type="button" data-voice-target="hazardProblem">语音输入问题</button>

          <label class="field">
            <span>整改措施</span>
            <textarea id="hazardMeasure" class="textarea" placeholder="例如：立即组织人员处理浮石，确认安全后方可作业。"></textarea>
          </label>
          <button class="button voice-button" type="button" data-voice-target="hazardMeasure">语音输入措施</button>

          <label class="field">
            <span>隐患发现人</span>
            <input id="hazardFinder" class="input" type="text" placeholder="默认使用检查组组长">
          </label>

          <div class="field photo-field">
            <span>问题照片</span>
            <div class="photo-source-actions">
              <button id="hazardCameraButton" class="button primary" type="button">拍照</button>
              <button id="hazardFileButton" class="button" type="button">从手机文件选择</button>
            </div>
            <input id="hazardCameraInput" class="hidden" type="file" accept="image/*" capture="environment" multiple>
            <input id="hazardPhotoInput" class="hidden" type="file" accept="image/*" multiple>
            <p class="field-tip">现场可直接调用相机，也可以从相册或手机文件中选择照片。</p>
          </div>
          <div id="draftPhotoList" class="photo-grid"></div>

          <div class="actions sticky-actions">
            <button id="saveHazardButton" class="button primary" type="submit">保存隐患</button>
            <button id="cancelHazardEditButton" class="button ghost hidden" type="button">取消编辑</button>
          </div>
        </form>
      </section>

      <section class="toolbar glass">
        <div class="search-wrap">
          <span class="search-icon">⌕</span>
          <input id="hazardSearchInput" class="input" type="search" placeholder="搜索编号、隐患、措施或发现人">
        </div>
        <div class="data-actions hazard-actions">
          <button id="exportExcelButton" class="button" type="button">导出Excel</button>
          <button id="exportHazardJsonButton" class="button" type="button">导出备份</button>
          <button id="importHazardJsonButton" class="button" type="button">导入备份</button>
          <button id="exportPhotosButton" class="button" type="button">导出照片</button>
          <input id="hazardImportFile" class="hidden" type="file" accept="application/json,.json" multiple>
        </div>
      </section>

      <section id="hazardListPanel" class="hazard-list" aria-label="隐患列表"></section>
      <section id="mergePanel" class="tool-card glass hidden"></section>
      <section id="photoPreviewPanel" class="tool-card glass hidden"></section>
    </div>
  `;

  bindHazardEvents();
  syncHazardEditorState();
  renderDraftPhotos();
  renderHazardList();
}

function renderHighRiskTool() {
  app.innerHTML = `
    <div class="tool-layout">
      <section id="editorPanel" class="tool-card glass">
        <div class="section-title">
          <div>
            <h2>高风险作业管控措施</h2>
            <p class="hint">日常点击卡片复制，需要新增或修改时再展开录入。</p>
          </div>
          <button id="toggleEditorButton" class="button primary" type="button" aria-expanded="false">新增</button>
        </div>

        <form id="measureForm" class="form-grid editor-form hidden">
          <label class="field">
            <span>小标题</span>
            <input id="titleInput" class="input" type="text" placeholder="例如：动火作业" autocomplete="off">
          </label>

          <label class="field">
            <span>管控措施内容</span>
            <textarea id="contentInput" class="textarea" placeholder="请输入需要复制的完整管控措施内容"></textarea>
          </label>

          <div class="actions">
            <button id="saveButton" class="button primary" type="submit">保存</button>
            <button id="cancelEditButton" class="button ghost hidden" type="button">取消编辑</button>
          </div>
        </form>
      </section>

      <section class="toolbar glass">
        <div class="search-wrap">
          <span class="search-icon">⌕</span>
          <input id="searchInput" class="input" type="search" placeholder="搜索标题或管控措施正文">
        </div>
        <div class="data-actions">
          <button id="exportButton" class="button" type="button">导出数据</button>
          <button id="importButton" class="button" type="button">导入数据</button>
          <button id="clearButton" class="button danger" type="button">清空数据</button>
          <input id="importFile" class="hidden" type="file" accept="application/json,.json">
        </div>
      </section>

      <section id="listPanel" class="measure-grid" aria-label="管控措施列表"></section>
    </div>
  `;

  bindHighRiskEvents();
  syncEditorState();
  renderMeasureList();
}

function bindHighRiskEvents() {
  document.querySelector("#toggleEditorButton").addEventListener("click", () => {
    state.editorOpen = !state.editorOpen;
    syncEditorState();
  });
  document.querySelector("#measureForm").addEventListener("submit", handleSubmit);
  document.querySelector("#cancelEditButton").addEventListener("click", cancelEdit);
  document.querySelector("#searchInput").addEventListener("input", (event) => {
    state.keyword = event.target.value.trim();
    renderMeasureList();
  });
  document.querySelector("#exportButton").addEventListener("click", exportData);
  document.querySelector("#importButton").addEventListener("click", () => document.querySelector("#importFile").click());
  document.querySelector("#importFile").addEventListener("change", importData);
  document.querySelector("#clearButton").addEventListener("click", clearData);
}

function bindHazardEvents() {
  document.querySelector("#inspectionForm").addEventListener("submit", handleInspectionSubmit);
  document.querySelector("#hazardForm").addEventListener("submit", handleHazardSubmit);
  document.querySelector("#hazardCameraButton").addEventListener("click", () => document.querySelector("#hazardCameraInput").click());
  document.querySelector("#hazardFileButton").addEventListener("click", () => document.querySelector("#hazardPhotoInput").click());
  document.querySelector("#hazardCameraInput").addEventListener("change", handleHazardPhotoInput);
  document.querySelector("#hazardPhotoInput").addEventListener("change", handleHazardPhotoInput);
  document.querySelector("#cancelHazardEditButton").addEventListener("click", cancelHazardEdit);
  document.querySelector("#clearHazardButton").addEventListener("click", clearHazardInspection);
  document.querySelector("#hazardSearchInput").addEventListener("input", (event) => {
    hazardState.keyword = event.target.value.trim();
    renderHazardList();
  });
  document.querySelector("#exportExcelButton").addEventListener("click", exportHazardExcel);
  document.querySelector("#exportHazardJsonButton").addEventListener("click", exportHazardJson);
  document.querySelector("#importHazardJsonButton").addEventListener("click", () => document.querySelector("#hazardImportFile").click());
  document.querySelector("#hazardImportFile").addEventListener("change", importHazardJson);
  document.querySelector("#exportPhotosButton").addEventListener("click", exportHazardPhotos);
  document.querySelectorAll("[data-voice-target]").forEach((button) => {
    button.addEventListener("click", () => startVoiceInput(button.dataset.voiceTarget, button));
  });
}

async function handleInspectionSubmit(event) {
  event.preventDefault();
  const date = document.querySelector("#inspectionDate").value || getTodayDate();
  const location = document.querySelector("#inspectionLocation").value.trim();
  const leader = document.querySelector("#inspectionLeader").value.trim();

  if (!date) {
    showToast("请填写检查时间");
    return;
  }
  if (!location) {
    showToast("请填写检查地点");
    return;
  }
  if (!leader) {
    showToast("请填写检查组组长");
    return;
  }

  hazardState.data.inspectionInfo = { date, location, leader };
  if (!(await trySaveHazardData())) {
    return;
  }
  showToast("检查信息已保存");
  await renderHazardCheckTool();
}

async function handleHazardSubmit(event) {
  event.preventDefault();

  if (!isInspectionReady()) {
    showToast("请先保存检查信息");
    return;
  }

  const problem = document.querySelector("#hazardProblem").value.trim();
  const measure = document.querySelector("#hazardMeasure").value.trim();
  const leader = hazardState.data.inspectionInfo.leader.trim();
  const finder = document.querySelector("#hazardFinder").value.trim() || leader;

  if (!problem) {
    showToast("请填写问题隐患");
    return;
  }
  if (!measure) {
    showToast("请填写整改措施");
    return;
  }
  if (!hazardState.draftPhotos.length) {
    showToast("请上传或拍摄问题照片");
    return;
  }

  const existing = hazardState.editingId
    ? hazardState.data.hazards.find((item) => item.id === hazardState.editingId)
    : null;
  const code = existing ? existing.code : getNextHazardCode();
  const inspectionInfo = existing && existing.inspectionInfo
    ? existing.inspectionInfo
    : { ...hazardState.data.inspectionInfo };
  const baseHazard = {
    id: existing ? existing.id : createId(),
    code,
    inspectionInfo,
    problem,
    measure,
    finder,
    supervisingLeader: existing?.supervisingLeader || "",
    responsibleUnit: existing?.responsibleUnit || "",
    responsiblePerson: existing?.responsiblePerson || "",
    deadline: existing?.deadline || "",
    createTime: existing ? existing.createTime : formatDateTime(new Date()),
    photos: hazardState.draftPhotos.map((photo) => ({ ...photo }))
  };

  try {
    baseHazard.photos = await regenerateHazardPhotos(baseHazard);
  } catch (error) {
    showToast("照片水印生成失败，请重试");
    return;
  }

  if (existing) {
    hazardState.data.hazards = hazardState.data.hazards.map((item) => (
      item.id === existing.id ? baseHazard : item
    ));
    showToast("更新成功");
  } else {
    hazardState.data.hazards.push(baseHazard);
    showToast("隐患保存成功");
  }

  if (!(await trySaveHazardData())) {
    return;
  }

  resetHazardForm();
  renderHazardList();
}

async function handleHazardPhotoInput(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";

  if (!files.length) {
    return;
  }

  const problem = document.querySelector("#hazardProblem").value.trim() || "未填写隐患";
  const editingHazard = hazardState.editingId
    ? hazardState.data.hazards.find((item) => item.id === hazardState.editingId)
    : null;
  const code = editingHazard ? editingHazard.code : getNextHazardCode();
  const photoInfo = editingHazard ? getHazardInspectionInfo(editingHazard) : hazardState.data.inspectionInfo;
  showToast("正在生成照片水印...");

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }
    try {
      const photoIndex = hazardState.draftPhotos.length + 1;
      const fileName = buildPhotoFileNameForInfo(photoInfo, code, problem, photoIndex);
      const originalDataUrl = await createCompressedPhoto(file);
      const watermarkedDataUrl = await createWatermarkedDataUrl(originalDataUrl, {
        code,
        problem,
        inspectionInfo: photoInfo,
        index: photoIndex,
        fileName
      });
      hazardState.draftPhotos.push({
        id: createId(),
        originalName: file.name,
        originalDataUrl,
        fileName,
        watermarkedDataUrl,
        mimeType: "image/jpeg"
      });
    } catch (error) {
      showToast("部分照片处理失败");
    }
  }

  renderDraftPhotos();
  showToast("照片水印生成成功");
  warnDraftPhotoSizeIfNeeded();
}

function renderDraftPhotos() {
  const panel = document.querySelector("#draftPhotoList");
  if (!panel) {
    return;
  }

  if (!hazardState.draftPhotos.length) {
    panel.innerHTML = `<div class="photo-empty">暂无照片，现场可直接拍照或从相册选择。</div>`;
    return;
  }

  panel.innerHTML = hazardState.draftPhotos.map((photo) => `
    <figure class="photo-thumb" data-photo-id="${escapeAttr(photo.id)}">
      <img src="${photo.watermarkedDataUrl}" alt="${escapeAttr(photo.fileName)}">
      <figcaption>${escapeHtml(photo.fileName)}</figcaption>
      <button class="icon-button delete photo-delete" type="button" aria-label="删除照片">×</button>
    </figure>
  `).join("");

  panel.querySelectorAll(".photo-delete").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.closest("[data-photo-id]").dataset.photoId;
      hazardState.draftPhotos = hazardState.draftPhotos.filter((photo) => photo.id !== id);
      renderDraftPhotos();
    });
  });
}

function warnDraftPhotoSizeIfNeeded() {
  const draftBytes = estimateTextBytes(JSON.stringify(hazardState.draftPhotos));
  if (draftBytes >= 1024 * 1024) {
    showToast(`当前待保存照片约 ${formatBytes(draftBytes)}，照片较多时请及时导出。`);
  }
}

function renderHazardList() {
  const panel = document.querySelector("#hazardListPanel");
  if (!panel) {
    return;
  }

  const keyword = hazardState.keyword.toLowerCase();
  const filtered = keyword
    ? hazardState.data.hazards.filter((item) => (
      `${item.code}\n${item.problem}\n${item.measure}\n${item.finder}`.toLowerCase().includes(keyword)
    ))
    : hazardState.data.hazards;

  if (!hazardState.data.hazards.length) {
    panel.className = "empty-state glass";
    panel.innerHTML = "<h3>暂无隐患记录。</h3><p>保存检查信息后，录入第一条现场隐患。</p>";
    return;
  }

  if (!filtered.length) {
    panel.className = "empty-state glass";
    panel.innerHTML = "<h3>未找到相关隐患</h3><p>可以尝试搜索编号、隐患内容、措施或发现人。</p>";
    return;
  }

  panel.className = "hazard-list";
  panel.innerHTML = filtered.map((item, index) => `
    <article class="hazard-card glass" data-id="${escapeAttr(item.id)}">
      <div class="hazard-summary-row">
        <div class="hazard-summary-main">
          <span class="hazard-summary-index">${index + 1}</span>
          <p class="hazard-summary-problem">${escapeHtml(item.problem)}</p>
          <span class="hazard-summary-location">${escapeHtml(getHazardInspectionInfo(item).location || "未填写地点")}</span>
        </div>
        <div class="hazard-mini-actions">
          <button class="icon-button edit" type="button" data-action="edit" title="编辑" aria-label="编辑隐患">✎</button>
          <button class="icon-button delete" type="button" data-action="delete" title="删除" aria-label="删除隐患">×</button>
        </div>
      </div>
      <details class="hazard-details">
        <summary>展开详情</summary>
        <div class="hazard-card-head">
          <div>
            <strong>${escapeHtml(item.code)}</strong>
            <span>${index + 1}</span>
          </div>
          <small>${escapeHtml(item.createTime)}</small>
        </div>
        <p><b>整改措施：</b>${escapeHtml(item.measure)}</p>
        <div class="hazard-meta">
          <span>发现人：${escapeHtml(item.finder)}</span>
          <span>照片：${item.photos.length}张</span>
        </div>
        <div class="hazard-card-actions">
          ${keyword ? "" : `
            <button class="button" type="button" data-action="move-up" ${hazardState.data.hazards.indexOf(item) === 0 ? "disabled" : ""}>上移</button>
            <button class="button" type="button" data-action="move-down" ${hazardState.data.hazards.indexOf(item) === hazardState.data.hazards.length - 1 ? "disabled" : ""}>下移</button>
          `}
          <button class="button" type="button" data-action="copy-problem">复制问题</button>
          <button class="button" type="button" data-action="copy-measure">复制措施</button>
          <button class="button" type="button" data-action="preview">照片</button>
        </div>
      </details>
    </article>
  `).join("");

  panel.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const hazard = getHazardByElement(button);
      const action = button.dataset.action;
      if (action === "edit") {
        editHazard(hazard);
      } else if (action === "delete") {
        deleteHazard(hazard);
      } else if (action === "move-up") {
        moveHazard(hazard.id, -1);
      } else if (action === "move-down") {
        moveHazard(hazard.id, 1);
      } else if (action === "copy-problem") {
        copyText(hazard.problem).then(() => showToast("已复制")).catch(() => showToast("复制失败，请手动复制"));
      } else if (action === "copy-measure") {
        copyText(hazard.measure).then(() => showToast("已复制")).catch(() => showToast("复制失败，请手动复制"));
      } else if (action === "preview") {
        previewHazardPhotos(hazard);
      }
    });
  });
}

async function moveHazard(id, direction) {
  const index = hazardState.data.hazards.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= hazardState.data.hazards.length) {
    return;
  }

  const hazards = hazardState.data.hazards;
  [hazards[index], hazards[nextIndex]] = [hazards[nextIndex], hazards[index]];
  await saveHazardData();
  renderHazardList();
  showToast("排序已更新");
}

function editHazard(hazard) {
  hazardState.editingId = hazard.id;
  hazardState.draftPhotos = hazard.photos.map((photo) => ({ ...photo }));
  document.querySelector("#hazardProblem").value = hazard.problem;
  document.querySelector("#hazardMeasure").value = hazard.measure;
  document.querySelector("#hazardFinder").value = hazard.finder;
  syncHazardEditorState();
  renderDraftPhotos();
  document.querySelector("#hazardEditorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteHazard(hazard) {
  if (!window.confirm("确认删除该隐患吗？对应照片也会一并删除。")) {
    return;
  }

  hazardState.data.hazards = hazardState.data.hazards.filter((item) => item.id !== hazard.id);
  if (hazardState.editingId === hazard.id) {
    resetHazardForm();
  }
  await saveHazardData();
  renderHazardList();
  hideHazardPhotoPreview();
  showToast("已删除");
}

function previewHazardPhotos(hazard) {
  const panel = document.querySelector("#photoPreviewPanel");
  hazardState.previewHazardId = hazard.id;
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div class="section-title">
      <div>
        <h2>${escapeHtml(hazard.code)} 照片预览</h2>
        <p class="hint">${escapeHtml(hazard.problem)}</p>
      </div>
      <button id="closePhotoPreview" class="button ghost" type="button">关闭</button>
    </div>
    <div class="photo-grid photo-grid-large">
      ${hazard.photos.map((photo) => `
        <figure class="photo-thumb">
          <img src="${photo.watermarkedDataUrl}" alt="${escapeAttr(photo.fileName)}">
          <figcaption>${escapeHtml(photo.fileName)}</figcaption>
        </figure>
      `).join("")}
    </div>
  `;
  document.querySelector("#closePhotoPreview").addEventListener("click", hideHazardPhotoPreview);
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideHazardPhotoPreview() {
  const panel = document.querySelector("#photoPreviewPanel");
  if (panel) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  }
}

function cancelHazardEdit() {
  resetHazardForm();
}

function resetHazardForm() {
  hazardState.editingId = null;
  hazardState.draftPhotos = [];
  const form = document.querySelector("#hazardForm");
  if (form) {
    form.reset();
  }
  const finder = document.querySelector("#hazardFinder");
  if (finder) {
    finder.value = hazardState.data.inspectionInfo.leader || "";
  }
  syncHazardEditorState();
  renderDraftPhotos();
}

function syncHazardEditorState() {
  const ready = isInspectionReady();
  const panel = document.querySelector("#hazardEditorPanel");
  const saveButton = document.querySelector("#saveHazardButton");
  const cancelButton = document.querySelector("#cancelHazardEditButton");
  const codeBadge = document.querySelector("#hazardCodeBadge");
  const finder = document.querySelector("#hazardFinder");

  if (!panel || !saveButton || !cancelButton || !codeBadge) {
    return;
  }

  panel.classList.toggle("disabled-panel", !ready);
  panel.querySelectorAll("input, textarea, button").forEach((element) => {
    if (element.id !== "cancelHazardEditButton") {
      element.disabled = !ready;
    }
  });
  codeBadge.textContent = getCurrentHazardCode();
  saveButton.textContent = hazardState.editingId ? "更新隐患" : "保存隐患";
  cancelButton.classList.toggle("hidden", !hazardState.editingId);
  if (finder && !finder.value) {
    finder.value = hazardState.data.inspectionInfo.leader || "";
  }
}

async function clearHazardInspection() {
  if (!window.confirm("确认清空本次检查全部信息和照片吗？此操作不可恢复。")) {
    return;
  }

  hazardState.data = createEmptyHazardData();
  hazardState.editingId = null;
  hazardState.draftPhotos = [];
  await deleteHazardDataFromDb();
  localStorage.removeItem(HAZARD_STORAGE_KEY);
  showToast("已清空");
  await renderHazardCheckTool();
}

function exportHazardJson() {
  const info = hazardState.data.inspectionInfo;
  downloadTextFile(
    `安全检查隐患数据备份_${safeFilePart(info.location || "未填写地点")}_${info.date || getTodayDate()}.json`,
    JSON.stringify(hazardState.data, null, 2),
    "application/json;charset=utf-8"
  );
  showToast("导出成功");
}

function importHazardJson(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) {
    return;
  }

  Promise.all(files.map(readHazardJsonFile))
    .then((imports) => {
      const validImports = imports.filter(Boolean);
      if (!validImports.length) {
        showToast("导入失败，请检查文件格式");
        return;
      }
      openMergePanel(validImports);
    })
    .catch(() => showToast("导入失败，请检查文件格式"));
}

function readHazardJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!isValidHazardData(parsed)) {
          throw new Error("invalid data");
        }
        resolve({
          fileName: file.name,
          data: normalizeHazardData(parsed)
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

function openMergePanel(imports) {
  const currentGroups = hazardState.data.hazards.length ? [{
    id: createId(),
    source: "现有数据",
    inspectionInfo: { ...hazardState.data.inspectionInfo },
    hazards: hazardState.data.hazards.map(cloneHazard)
  }] : [];
  const importedGroups = imports.map((entry) => ({
      id: createId(),
      source: entry.fileName || "导入文件",
      inspectionInfo: { ...entry.data.inspectionInfo },
      hazards: entry.data.hazards.map(cloneHazard)
    }));

  hazardState.mergeDraft = {
    imports,
    groups: [...currentGroups, ...importedGroups]
  };
  renderMergePanel();
}

function renderMergePanel() {
  const panel = document.querySelector("#mergePanel");
  if (!panel || !hazardState.mergeDraft) {
    return;
  }

  const { groups, imports } = hazardState.mergeDraft;
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div class="section-title">
      <div>
        <h2>整份数据排序</h2>
        <p class="hint">已包含现有数据和 ${imports.length} 份导入文件。这里只调整每份数据的先后，不拆分单条隐患，不重做水印。</p>
      </div>
    </div>
    <div class="merge-list">
      ${groups.map((group, index) => `
        <article class="merge-row" data-merge-id="${escapeAttr(group.id)}">
          <div>
            <strong>${String(index + 1).padStart(2, "0")}｜${escapeHtml(group.source)}</strong>
            <span>${escapeHtml(group.inspectionInfo.date || "")}｜${escapeHtml(group.inspectionInfo.location || "未填写地点")}｜${escapeHtml(group.inspectionInfo.leader || "未填写组长")}</span>
            <p>共 ${group.hazards.length} 条隐患：${escapeHtml(group.hazards[0]?.problem || "暂无隐患")}</p>
          </div>
          <div class="merge-actions">
            <button class="button small-button" type="button" data-merge-action="up" ${index === 0 ? "disabled" : ""}>上移</button>
            <button class="button small-button" type="button" data-merge-action="down" ${index === groups.length - 1 ? "disabled" : ""}>下移</button>
          </div>
        </article>
      `).join("")}
    </div>
    <div class="actions">
      <button id="confirmMergeButton" class="button primary" type="button">确认按此顺序合并</button>
      <button id="cancelMergeButton" class="button ghost" type="button">取消导入</button>
    </div>
  `;

  panel.querySelectorAll("[data-merge-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.closest("[data-merge-id]").dataset.mergeId;
      moveMergeItem(id, button.dataset.mergeAction === "up" ? -1 : 1);
    });
  });
  document.querySelector("#confirmMergeButton").addEventListener("click", confirmMergeDraft);
  document.querySelector("#cancelMergeButton").addEventListener("click", cancelMergeDraft);
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function moveMergeItem(id, direction) {
  const groups = hazardState.mergeDraft.groups;
  const index = groups.findIndex((group) => group.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= groups.length) {
    return;
  }
  [groups[index], groups[nextIndex]] = [groups[nextIndex], groups[index]];
  renderMergePanel();
}

async function confirmMergeDraft() {
  if (!hazardState.mergeDraft) {
    return;
  }

  const groups = hazardState.mergeDraft.groups;
  showToast("正在按整份数据合并...");
  hazardState.data.inspectionInfo = groups[0]?.inspectionInfo || hazardState.data.inspectionInfo;
  hazardState.data.hazards = groups.flatMap((group) => (
    group.hazards.map((hazard) => ({
      ...cloneHazard(hazard),
      inspectionInfo: getHazardInspectionInfo(hazard, group.inspectionInfo)
    }))
  ));
  hazardState.mergeDraft = null;
  if (!(await trySaveHazardData())) {
    return;
  }
  hideMergePanel();
  renderHazardList();
  showToast("合并成功，原检查信息和水印已保留");
}

function cancelMergeDraft() {
  hazardState.mergeDraft = null;
  hideMergePanel();
  showToast("已取消导入");
}

function hideMergePanel() {
  const panel = document.querySelector("#mergePanel");
  if (panel) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  }
}

function exportHazardExcel() {
  const rows = hazardState.data.hazards.map((hazard, index) => ({
    "序号": index + 1,
    "检查时间": getHazardInspectionInfo(hazard).date,
    "检查地点": getHazardInspectionInfo(hazard).location,
    "隐患编号": hazard.code,
    "问题隐患": hazard.problem,
    "整改措施": hazard.measure,
    "隐患发现人": hazard.finder,
    "问题照片文件名": hazard.photos.map((photo) => photo.fileName).join("；"),
    "录入时间": hazard.createTime
  }));
  const fileBase = `安全检查隐患清单_${safeFilePart(hazardState.data.inspectionInfo.location || "未填写地点")}_${hazardState.data.inspectionInfo.date || getTodayDate()}`;

  if (window.XLSX) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "隐患清单");
    XLSX.writeFile(workbook, `${fileBase}.xlsx`);
  } else {
    exportCsv(rows, `${fileBase}.csv`);
  }
  showToast("导出成功");
}

async function exportHazardPhotos() {
  const photos = hazardState.data.hazards.flatMap((hazard) => (
    hazard.photos.map((photo) => ({ ...photo, code: hazard.code, inspectionInfo: getHazardInspectionInfo(hazard) }))
  ));

  if (!photos.length) {
    showToast("暂无可导出的照片");
    return;
  }

  const info = hazardState.data.inspectionInfo;
  const fileBase = `安全检查照片_${safeFilePart(info.location || "未填写地点")}_${info.date || getTodayDate()}`;

  if (window.JSZip) {
    const zip = new JSZip();
    photos.forEach((photo) => {
      zip.file(`${safeFilePart(photo.inspectionInfo.location || "未填写地点")}/${photo.code}/${photo.fileName}`, dataUrlToBase64(photo.watermarkedDataUrl), { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(`${fileBase}.zip`, blob);
  } else {
    photos.forEach((photo, index) => {
      setTimeout(() => downloadDataUrl(photo.fileName, photo.watermarkedDataUrl), index * 250);
    });
  }
  showToast("导出成功");
}

function startVoiceInput(targetId, button) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const target = document.querySelector(`#${targetId}`);

  if (!Recognition || !target) {
    showToast("当前浏览器不支持语音输入");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.continuous = false;
  const originalText = button.textContent;
  button.textContent = "正在听...";
  button.disabled = true;

  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("")
      .trim();
    if (text) {
      target.value = target.value ? `${target.value}${text}` : text;
    }
  };
  recognition.onerror = () => showToast("当前浏览器不支持语音输入，请手动输入。");
  recognition.onend = () => {
    button.textContent = originalText;
    button.disabled = false;
  };
  recognition.start();
}

function createEmptyHazardData() {
  return {
    inspectionInfo: {
      date: getTodayDate(),
      location: "",
      leader: ""
    },
    hazards: []
  };
}

async function loadHazardData() {
  try {
    const fromDb = await readHazardDataFromDb();
    if (fromDb && isValidHazardData(fromDb)) {
      return normalizeHazardData(fromDb);
    }

    const migrated = loadHazardDataFromLocalStorage();
    if (migrated) {
      await writeHazardDataToDb(migrated);
      localStorage.removeItem(HAZARD_STORAGE_KEY);
      showToast("历史数据已迁移到 IndexedDB");
      return migrated;
    }
  } catch (error) {
    console.warn("Failed to load IndexedDB hazard data", error);
    const fallback = loadHazardDataFromLocalStorage();
    if (fallback) {
      showToast("IndexedDB 读取失败，已临时读取旧本地数据");
      return fallback;
    }
  }

  return createEmptyHazardData();
}

async function saveHazardData() {
  const serialized = JSON.stringify(hazardState.data);
  await writeHazardDataToDb(hazardState.data);
  warnHazardStorageIfNeeded(serialized);
}

async function trySaveHazardData() {
  try {
    await saveHazardData();
    return true;
  } catch (error) {
    notifyHazardStorageFull();
    return false;
  }
}

function loadHazardDataFromLocalStorage() {
  const stored = localStorage.getItem(HAZARD_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored);
    return isValidHazardData(parsed) ? normalizeHazardData(parsed) : null;
  } catch (error) {
    console.warn("Failed to parse stored hazard data", error);
    return null;
  }
}

function openHazardDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unsupported"));
      return;
    }

    const request = indexedDB.open(HAZARD_DB_NAME, HAZARD_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HAZARD_STORE_NAME)) {
        db.createObjectStore(HAZARD_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readHazardDataFromDb() {
  return readDbRecord(HAZARD_RECORD_KEY);
}

async function writeHazardDataToDb(data) {
  return writeDbRecord(HAZARD_RECORD_KEY, data);
}

async function deleteHazardDataFromDb() {
  return deleteDbRecord(HAZARD_RECORD_KEY);
}

async function readDbRecord(id) {
  const db = await openHazardDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HAZARD_STORE_NAME, "readonly");
    const store = transaction.objectStore(HAZARD_STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function writeDbRecord(id, data) {
  const db = await openHazardDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HAZARD_STORE_NAME, "readwrite");
    const store = transaction.objectStore(HAZARD_STORE_NAME);
    store.put({
      id,
      data,
      updateTime: new Date().toISOString()
    });
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function deleteDbRecord(id) {
  const db = await openHazardDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HAZARD_STORE_NAME, "readwrite");
    const store = transaction.objectStore(HAZARD_STORE_NAME);
    store.delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function warnHazardStorageIfNeeded(serializedData) {
  const bytes = estimateTextBytes(serializedData);
  if (bytes < HAZARD_STORAGE_WARN_BYTES) {
    hazardState.storageWarned = false;
    return;
  }

  if (!hazardState.storageWarned) {
    hazardState.storageWarned = true;
    showToast(`本地数据已接近容量：约 ${formatBytes(bytes)}，请及时导出备份和照片。`);
  }
}

function notifyHazardStorageFull() {
  const message = "本地存储空间不足，新增数据未能保存。请先导出数据备份和水印照片，再删除部分隐患或清空本次检查。";
  showToast("本地存储空间不足，请先导出并清理照片。");
  window.alert(message);
}

function estimateTextBytes(text) {
  return String(text).length * 2;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }
  return `${Math.ceil(bytes / 1024)}KB`;
}

function isInspectionReady() {
  const info = hazardState.data.inspectionInfo;
  return Boolean(info.date && info.location && info.leader);
}

function getNextHazardCode() {
  const currentLocation = hazardState.data.inspectionInfo.location || "未填写地点";
  const maxNumber = hazardState.data.hazards.reduce((max, item) => {
    if ((getHazardInspectionInfo(item).location || "未填写地点") !== currentLocation) {
      return max;
    }
    const match = String(item.code || "").match(/YH-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return buildHazardCodeForInfo(hazardState.data.inspectionInfo, maxNumber + 1);
}

function buildHazardCodeForInfo(info, number) {
  const location = safeFilePart(info.location || "未填写地点");
  return `${location}-YH-${String(number).padStart(3, "0")}`;
}

function getEditingHazardCode() {
  const hazard = hazardState.data.hazards.find((item) => item.id === hazardState.editingId);
  return hazard ? hazard.code : getNextHazardCode();
}

function getCurrentHazardCode() {
  return hazardState.editingId ? getEditingHazardCode() : getNextHazardCode();
}

function getHazardByElement(element) {
  const card = element.closest("[data-id]");
  return hazardState.data.hazards.find((item) => item.id === card.dataset.id);
}

async function regenerateHazardPhotos(hazard) {
  const photos = [];
  for (let index = 0; index < hazard.photos.length; index += 1) {
    const photo = hazard.photos[index];
    const fileName = buildPhotoFileNameForInfo(getHazardInspectionInfo(hazard), hazard.code, hazard.problem, index + 1);
    const source = dataUrlToFile(photo.originalDataUrl || photo.watermarkedDataUrl, photo.originalName || fileName);
    const watermarkedDataUrl = await createWatermarkedPhoto(source, {
      code: hazard.code,
      problem: hazard.problem,
      finder: hazard.finder,
      inspectionInfo: getHazardInspectionInfo(hazard),
      index: index + 1,
      fileName
    });
    photos.push({
      ...photo,
      fileName,
      watermarkedDataUrl,
      mimeType: "image/jpeg"
    });
  }
  return photos;
}

function buildPhotoFileName(code, problem, index) {
  const info = hazardState.data.inspectionInfo;
  return buildPhotoFileNameForInfo(info, code, problem, index);
}

function buildPhotoFileNameForInfo(info, code, problem, index) {
  const date = info.date || getTodayDate();
  const location = safeFilePart(info.location || "未填写地点");
  const summary = safeFilePart(problem || "未填写隐患").slice(0, 15) || "未填写隐患";
  return `${date}_${location}_${code}_${summary}_${String(index).padStart(2, "0")}.jpg`;
}

function createWatermarkedPhoto(file, options) {
  return createCompressedPhoto(file).then((dataUrl) => createWatermarkedDataUrl(dataUrl, options));
}

function createCompressedPhoto(file, maxWidth = MAX_PHOTO_WIDTH, quality = PHOTO_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        try {
          const scale = image.width > maxWidth ? maxWidth / image.width : 1;
          const width = Math.round(image.width * scale);
          const height = Math.round(image.height * scale);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createWatermarkedDataUrl(dataUrl, options) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const info = options.inspectionInfo || hazardState.data.inspectionInfo;
          const line1 = `${info.date || getTodayDate()}｜${info.location || "未填写地点"}`;
          const line2 = `问题隐患：${options.problem}`;
          const line3 = `${options.code}｜发现人：${options.finder || document.querySelector("#hazardFinder")?.value.trim() || info.leader || "未填写"}`;
          drawWatermark(ctx, canvas, [line1, line2, line3]);
          resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function drawWatermark(ctx, canvas, lines) {
  const padding = Math.max(18, Math.round(canvas.width * 0.018));
  const fontSize = Math.max(24, Math.round(canvas.width * 0.026));
  const lineHeight = Math.round(fontSize * 1.45);
  const watermarkHeight = padding * 2 + lineHeight * lines.length;
  const top = canvas.height - watermarkHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(0, top, canvas.width, watermarkHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    const text = index === 1 ? fitCanvasText(ctx, line, canvas.width - padding * 2) : line;
    ctx.fillText(text, padding, top + padding + index * lineHeight);
  });
}

function fitCanvasText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let output = text;
  while (output.length > 6 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function dataUrlToFile(dataUrl, fileName) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mime });
}

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(",")[1] || "";
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrlToBase64(dataUrl);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isValidHazardData(data) {
  return Boolean(
    data &&
    typeof data === "object" &&
    data.inspectionInfo &&
    typeof data.inspectionInfo === "object" &&
    Array.isArray(data.hazards)
  );
}

function normalizeHazardData(data) {
  const rootInfo = {
    date: data.inspectionInfo.date || getTodayDate(),
    location: data.inspectionInfo.location || "",
    leader: data.inspectionInfo.leader || ""
  };
  return {
    inspectionInfo: rootInfo,
    hazards: data.hazards.map((item, index) => ({
      id: item.id || createId(),
      code: item.code || buildHazardCodeForInfo(item.inspectionInfo || rootInfo, index + 1),
      inspectionInfo: {
        date: item.inspectionInfo?.date || rootInfo.date,
        location: item.inspectionInfo?.location || rootInfo.location,
        leader: item.inspectionInfo?.leader || rootInfo.leader
      },
      problem: item.problem || "",
      measure: item.measure || "",
      finder: item.finder || item.inspectionInfo?.leader || rootInfo.leader || "",
      supervisingLeader: item.supervisingLeader || "",
      responsibleUnit: item.responsibleUnit || "",
      responsiblePerson: item.responsiblePerson || "",
      deadline: item.deadline || "",
      createTime: item.createTime || formatDateTime(new Date()),
      photos: Array.isArray(item.photos) ? item.photos.map((photo) => ({
        id: photo.id || createId(),
        originalName: photo.originalName || photo.fileName || "photo.jpg",
        originalDataUrl: photo.originalDataUrl || photo.watermarkedDataUrl || "",
        fileName: photo.fileName || "photo.jpg",
        watermarkedDataUrl: photo.watermarkedDataUrl || "",
        mimeType: photo.mimeType || "image/jpeg"
      })) : []
    }))
  };
}

function mergeHazardData(currentData, importedData) {
  const current = normalizeHazardData(currentData);
  const imported = normalizeHazardData(importedData);
  const hasCurrentInfo = Boolean(
    current.inspectionInfo.date &&
    current.inspectionInfo.location &&
    current.inspectionInfo.leader
  );

  return {
    inspectionInfo: hasCurrentInfo ? current.inspectionInfo : imported.inspectionInfo,
    hazards: [
      ...current.hazards,
      ...imported.hazards.map((hazard) => ({
        ...hazard,
        id: createId(),
        photos: hazard.photos.map((photo) => ({
          ...photo,
          id: createId()
        }))
      }))
    ]
  };
}

async function renumberHazards(hazards) {
  const result = [];
  for (let index = 0; index < hazards.length; index += 1) {
    const hazard = hazards[index];
    const code = `YH-${String(index + 1).padStart(3, "0")}`;
    const updated = {
      ...cloneHazard(hazard),
      id: hazard.id || createId(),
      code,
      photos: hazard.photos.map((photo, photoIndex) => ({
        ...photo,
        id: photo.id || createId(),
        fileName: buildPhotoFileNameForInfo(hazardState.data.inspectionInfo, code, hazard.problem, photoIndex + 1)
      }))
    };
    const photos = [];
    for (let photoIndex = 0; photoIndex < updated.photos.length; photoIndex += 1) {
      const photo = updated.photos[photoIndex];
      let watermarkedDataUrl = photo.watermarkedDataUrl;
      try {
        watermarkedDataUrl = await createWatermarkedDataUrl(photo.originalDataUrl || photo.watermarkedDataUrl, {
          code: updated.code,
          problem: updated.problem,
          finder: updated.finder,
          index: photoIndex + 1,
          fileName: photo.fileName
        });
      } catch (error) {
        watermarkedDataUrl = photo.watermarkedDataUrl;
      }
      photos.push({ ...photo, watermarkedDataUrl });
    }
    result.push({
      ...updated,
      photos
    });
  }
  return result;
}

function cloneHazard(hazard) {
  return {
    ...hazard,
    inspectionInfo: getHazardInspectionInfo(hazard),
    photos: Array.isArray(hazard.photos) ? hazard.photos.map((photo) => ({ ...photo })) : []
  };
}

function getHazardInspectionInfo(hazard, fallbackInfo = hazardState.data.inspectionInfo) {
  const info = hazard?.inspectionInfo || fallbackInfo || {};
  return {
    date: info.date || fallbackInfo?.date || getTodayDate(),
    location: info.location || fallbackInfo?.location || "",
    leader: info.leader || fallbackInfo?.leader || ""
  };
}

function exportCsv(rows, fileName) {
  const headers = Object.keys(rows[0] || {
    "序号": "",
    "检查时间": "",
    "检查地点": "",
    "隐患编号": "",
    "问题隐患": "",
    "整改措施": "",
    "隐患发现人": "",
    "问题照片文件名": "",
    "录入时间": ""
  });
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))
  ];
  downloadTextFile(fileName, `\uFEFF${lines.join("\n")}`, "text/csv;charset=utf-8");
}

function downloadTextFile(fileName, content, type) {
  downloadBlob(fileName, new Blob([content], { type }));
}

function downloadBlob(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadDataUrl(fileName, dataUrl) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getTodayDate() {
  const date = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatChineseDate(value) {
  const text = String(value || "").trim();
  const matched = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matched) {
    return `${matched[1]}年${Number(matched[2])}月${Number(matched[3])}日`;
  }

  if (text) {
    return text;
  }

  const date = new Date();
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTime(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function safeFilePart(value) {
  return String(value || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[，。；、！]/g, "")
    .trim() || "未填写";
}

function handleSubmit(event) {
  event.preventDefault();

  const titleInput = document.querySelector("#titleInput");
  const contentInput = document.querySelector("#contentInput");
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    showToast("小标题和管控措施内容不能为空");
    return;
  }

  if (state.editingId) {
    state.measures = state.measures.map((item) => (
      item.id === state.editingId ? { ...item, title, content } : item
    ));
    saveMeasures();
    showToast("更新成功");
  } else {
    state.measures.unshift({
      id: createId(),
      title,
      content,
      createTime: new Date().toISOString()
    });
    saveMeasures();
    showToast("保存成功");
  }

  titleInput.value = "";
  contentInput.value = "";
  state.editingId = null;
  state.editorOpen = false;
  syncEditorState();
  renderMeasureList();
}

function renderMeasureList() {
  const listPanel = document.querySelector("#listPanel");
  const keyword = state.keyword.toLowerCase();
  const filtered = keyword
    ? state.measures.filter((item) => `${item.title}\n${item.content}`.toLowerCase().includes(keyword))
    : state.measures;

  if (!state.measures.length) {
    listPanel.className = "empty-state glass";
    listPanel.innerHTML = "<h3>暂无管控措施，请先添加。</h3><p>添加后会自动保存到当前浏览器。</p>";
    return;
  }

  if (!filtered.length) {
    listPanel.className = "empty-state glass";
    listPanel.innerHTML = "<h3>未找到相关管控措施。</h3><p>可以尝试换一个关键词。</p>";
    return;
  }

  listPanel.className = "measure-grid";
  listPanel.innerHTML = filtered.map((item) => `
    <article class="measure-card" data-id="${escapeAttr(item.id)}">
      <div class="card-tools">
        <button class="icon-button edit" type="button" title="编辑" aria-label="编辑 ${escapeAttr(item.title)}">✎</button>
        <button class="icon-button delete" type="button" title="删除" aria-label="删除 ${escapeAttr(item.title)}">×</button>
      </div>
      <button class="card-body" type="button">
        <span class="card-title">${escapeHtml(item.title)}</span>
        <span class="card-preview">${escapeHtml(item.content).replace(/\n/g, " ")}</span>
      </button>
    </article>
  `).join("");

  listPanel.querySelectorAll(".card-body").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getMeasureByCard(button);
      copyMeasure(item);
    });
  });

  listPanel.querySelectorAll(".edit").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      editMeasure(getMeasureByCard(button));
    });
  });

  listPanel.querySelectorAll(".delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteMeasure(getMeasureByCard(button));
    });
  });
}

function copyMeasure(item) {
  copyText(item.content)
    .then(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      showToast(`已复制：${item.title}`);
    })
    .catch(() => showToast("复制失败，请手动复制"));
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function editMeasure(item) {
  document.querySelector("#titleInput").value = item.title;
  document.querySelector("#contentInput").value = item.content;
  state.editingId = item.id;
  state.editorOpen = true;
  syncEditorState();
  document.querySelector("#editorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteMeasure(item) {
  if (!window.confirm("确认删除这条管控措施吗？")) {
    return;
  }

  state.measures = state.measures.filter((measure) => measure.id !== item.id);
  if (state.editingId === item.id) {
    cancelEdit();
  }
  saveMeasures();
  renderMeasureList();
  showToast("已删除");
}

function cancelEdit() {
  state.editingId = null;
  state.editorOpen = false;
  document.querySelector("#titleInput").value = "";
  document.querySelector("#contentInput").value = "";
  syncEditorState();
}

function syncEditorState() {
  const isEditing = Boolean(state.editingId);
  const form = document.querySelector("#measureForm");
  const toggleButton = document.querySelector("#toggleEditorButton");
  form.classList.toggle("hidden", !state.editorOpen);
  toggleButton.textContent = state.editorOpen ? "收起" : "新增";
  toggleButton.setAttribute("aria-expanded", String(state.editorOpen));
  document.querySelector("#saveButton").textContent = isEditing ? "更新" : "保存";
  document.querySelector("#cancelEditButton").classList.toggle("hidden", !isEditing);
}

function exportData() {
  const data = JSON.stringify(state.measures, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `high-risk-measures-backup-${formatDateForFile(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("导出成功");
}

function importData(event) {
  const file = event.target.files[0];
  event.target.value = "";

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!isValidMeasureArray(parsed)) {
        throw new Error("invalid data");
      }

      if (!window.confirm("导入数据将覆盖当前本地数据，是否继续？")) {
        return;
      }

      state.measures = parsed.map((item) => ({
        id: item.id || createId(),
        title: String(item.title).trim(),
        content: String(item.content).trim(),
        createTime: item.createTime || new Date().toISOString()
      }));
      state.editingId = null;
      saveMeasures();
      syncEditorState();
      renderMeasureList();
      showToast("导入成功");
    } catch (error) {
      showToast("导入失败，请检查文件格式");
    }
  };
  reader.onerror = () => showToast("导入失败，请检查文件格式");
  reader.readAsText(file, "utf-8");
}

function clearData() {
  if (!window.confirm("确认清空所有管控措施吗？此操作不可恢复。")) {
    return;
  }

  state.measures = [];
  state.editingId = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  syncEditorState();
  renderMeasureList();
  showToast("已清空");
}

function loadMeasures() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn("Failed to parse stored measures", error);
    }
  }

  const initialData = sampleMeasures.map((item) => ({
    id: createId(),
    title: item.title,
    content: item.content,
    createTime: new Date().toISOString()
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

function saveMeasures() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.measures));
}

function getMeasureByCard(element) {
  const card = element.closest(".measure-card");
  return state.measures.find((item) => item.id === card.dataset.id);
}

function isValidMeasureArray(data) {
  return Array.isArray(data) && data.every((item) => (
    item &&
    typeof item === "object" &&
    typeof item.title === "string" &&
    item.title.trim() &&
    typeof item.content === "string" &&
    item.content.trim()
  ));
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDateForFile(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
