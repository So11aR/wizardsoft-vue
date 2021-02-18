export default {
	resetCheckbox(checkboxes) {
		checkboxes.forEach((checkbox) => (checkbox.checked = false));
	},
	resetCheckboxAll(checkbox) {
		checkbox && (checkbox.checked = false);
	},
	

}