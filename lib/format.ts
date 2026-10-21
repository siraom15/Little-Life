const currencyFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});
export const baht = (amount: number) => currencyFormatter.format(amount);
