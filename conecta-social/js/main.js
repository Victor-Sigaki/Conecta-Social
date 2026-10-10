"use strict";
const $ = (s, c = document) => c.querySelector(s),
  $$ = (s, c = document) => [...c.querySelectorAll(s)];
const toggle = $(".menu-toggle"),
  nav = $("#menu");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  $$("#menu a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }),
  );
}
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());
const contact = $("#contact-form");
if (contact)
  contact.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contact.reportValidity()) return;
    $("#contact-feedback").textContent =
      "Mensagem validada! Esta demonstração não envia mensagens para um servidor.";
    contact.reset();
  });
let amount = 50;
const amountLabel = $("#selected-amount");
$$(".donation-choice").forEach((b) =>
  b.addEventListener("click", () => {
    amount = Number(b.dataset.amount);
    $$(".donation-choice").forEach((x) =>
      x.setAttribute("aria-pressed", String(x === b)),
    );
    if (amountLabel)
      amountLabel.textContent = amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    const f = $("#donation-feedback");
    if (f) f.textContent = "";
  }),
);
const donate = $("#donate-demo");
if (donate)
  donate.addEventListener("click", () => {
    $("#donation-feedback").textContent =
      `Intenção demonstrativa de ${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} selecionada. Nenhum pagamento foi realizado.`;
  });
const digits = (v) => v.replace(/\D/g, "");
function maskCpf(v) {
  return digits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v) {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskCep(v) {
  return digits(v)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}
function validCpf(v) {
  const d = digits(v);
  if (d.length !== 11 || /^([0-9])\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(d[i]) * (10 - i);
  let c = (s * 10) % 11;
  if (c === 10) c = 0;
  if (c !== Number(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += Number(d[i]) * (11 - i);
  c = (s * 10) % 11;
  if (c === 10) c = 0;
  return c === Number(d[10]);
}
const cpf = $("#cpf"),
  phone = $("#telefone"),
  cep = $("#cep");
if (cpf)
  cpf.addEventListener("input", () => {
    cpf.value = maskCpf(cpf.value);
    clearError(cpf);
  });
if (phone)
  phone.addEventListener("input", () => {
    phone.value = maskPhone(phone.value);
    clearError(phone);
  });
if (cep)
  cep.addEventListener("input", () => {
    cep.value = maskCep(cep.value);
    clearError(cep);
  });
function clearError(field) {
  field.removeAttribute("aria-invalid");
  const e = $(`#${field.id}-error`);
  if (e) e.textContent = "";
}
function setError(field, msg) {
  field.setAttribute("aria-invalid", "true");
  const e = $(`#${field.id}-error`);
  if (e) e.textContent = msg;
}
function validate(field) {
  clearError(field);
  if (!field.checkValidity()) {
    let msg = field.validationMessage || "Confira este campo.";
    if (field.validity.valueMissing) msg = "Este campo é obrigatório.";
    else if (field.validity.typeMismatch) msg = "Digite um e-mail válido.";
    else if (field.validity.tooShort)
      msg = `Digite pelo menos ${field.minLength} caracteres.`;
    else if (field.validity.patternMismatch)
      msg = field.title || "Confira o formato informado.";
    setError(field, msg);
    return false;
  }
  if (field.id === "cpf" && !validCpf(field.value)) {
    setError(field, "Digite um CPF válido. Use dados fictícios para testar.");
    return false;
  }
  if (
    field.id === "nascimento" &&
    field.value &&
    new Date(field.value + "T00:00:00") > new Date()
  ) {
    setError(field, "A data de nascimento não pode estar no futuro.");
    return false;
  }
  return true;
}
const form = $("#registration-form"),
  key = "conectaSocialRegistrosDemo";
function records() {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function renderRecords() {
  const list = $("#records-list");
  if (!list) return;
  list.replaceChildren();
  const items = records();
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhum registro local.";
    list.append(li);
    return;
  }
  items.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.nome} — ${r.interesse} — ${r.data}`;
    list.append(li);
  });
}
if (form) {
  const interest = new URLSearchParams(location.search).get("interesse");
  if (["voluntariado", "doacao", "parceria"].includes(interest)) {
    const radio = $(`input[name="interesse"][value="${interest}"]`);
    if (radio) radio.checked = true;
  }
  const fields = $$(
    'input[required]:not([type="radio"]),select[required],textarea[required]',
    form,
  );
  fields.forEach((f) => f.addEventListener("blur", () => validate(f)));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = fields.map(validate);
    const selected = $('input[name="interesse"]:checked', form);
    const consent = $("#consentimento");
    let otherValid = true;
    if (!selected) {
      $("#registration-feedback").textContent =
        "Selecione uma forma de participação.";
      otherValid = false;
    }
    if (!consent.checked) {
      setError(consent, "É necessário confirmar o aviso de demonstração.");
      otherValid = false;
    } else clearError(consent);
    if (results.includes(false) || !otherValid) {
      const first = fields.find(
        (f) => f.getAttribute("aria-invalid") === "true",
      );
      if (first) first.focus();
      return;
    }
    const data = new FormData(form);
    const entry = {
      nome: String(data.get("nome")).trim(),
      email: String(data.get("email")).trim(),
      interesse: String(data.get("interesse")),
      data: new Date().toLocaleDateString("pt-BR"),
    };
    const all = records();
    all.push(entry);
    try {
      localStorage.setItem(key, JSON.stringify(all));
    } catch {
      $("#registration-feedback").textContent =
        "Não foi possível salvar neste navegador. Verifique as permissões de armazenamento.";
      return;
    }
    $("#registration-feedback").textContent = "";
    $("#registration-success").hidden = false;
    $("#registration-success").focus();
    $("#local-records").hidden = true;
    form.reset();
    fields.forEach(clearError);
  });
  form.addEventListener("reset", () =>
    setTimeout(() => {
      fields.forEach(clearError);
      $("#registration-feedback").textContent = "";
      $("#registration-success").hidden = true;
      clearError(consent);
    }, 0),
  );
  const show = $("#show-records");
  if (show)
    show.addEventListener("click", () => {
      $("#local-records").hidden = false;
      renderRecords();
      $("#local-records").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  const clear = $("#clear-records");
  if (clear)
    clear.addEventListener("click", () => {
      localStorage.removeItem(key);
      renderRecords();
    });
}
