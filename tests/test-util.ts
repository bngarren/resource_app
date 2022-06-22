export const expectDatesAreCloseEnough = (date1: Date, date2: Date): void => {
  expect(date1.getUTCDay()).toEqual(date2.getUTCDay());
  expect(date1.getUTCMinutes()).toEqual(date2.getUTCMinutes());
};
