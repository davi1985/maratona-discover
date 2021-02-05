// modal script
const Modal = {
  open() {
    // open modal adding class active
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    // close modal removing class active
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

// localstorage
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    // sum all entries
    let incomes = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount > 0) incomes += transaction.amount;
    });
    return incomes;
  },

  expenses() {
    // sum all expenses
    let expenses = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount < 0) expenses += transaction.amount;
    });
    return expenses;
  },

  total() {
    // entries minus expenses
    return this.incomes() + this.expenses();
  },
};

// subs HTML data with JS
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransactional(transaction);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransactional(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img class="remove" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );

    Transaction.total() < 0
      ? Utils.formatTotalCardNegative()
      : Utils.formatTotalCardPositive();
  },

  clearTransaction() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    // value = Number(value.replace(/\,\./g, "")) * 100;
    return value;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },

  formatDate(date) {
    const splitted = date.split("-").reverse();
    return `${splitted[0]}/${splitted[1]}/${splitted[2]}`;
  },

  formatTotalCardNegative() {
    const cardTotal = document.querySelector(".total");
    cardTotal.style.backgroundColor = " #e92929";
  },

  formatTotalCardPositive() {
    const cardTotal = document.querySelector(".total");
    cardTotal.style.backgroundColor = " #12a454";
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = this.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = this.getValues();
    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      // validate fields
      this.validateFields();

      // format data
      const transaction = this.formatValues();

      // save transaction
      Transaction.add(transaction);

      // clear form
      this.clearFields();

      // close modal
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();
    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransaction();
    this.init();
  },
};

App.init();
