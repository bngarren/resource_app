export const expectDatesAreCloseEnough = (date1: Date, date2: Date): void => {
  expect(date1.getUTCDay()).toEqual(date2.getUTCDay());
  expect(date1.getUTCMinutes()).toEqual(date2.getUTCMinutes());
};

export const expectDatesAreNotClose = (date1: Date, date2: Date): void => {
  expect(date1.getUTCDay()).not.toEqual(date2.getUTCDay());
  expect(date1.getUTCMinutes()).not.toEqual(date2.getUTCMinutes());
};
