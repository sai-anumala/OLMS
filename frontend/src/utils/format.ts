// "3 out of 10" copy count shown on book cards and in the details modal
export const copiesLabel = (availability: number, copies?: number) => `${availability} out of ${copies ?? availability}`;

export const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "N/A");
