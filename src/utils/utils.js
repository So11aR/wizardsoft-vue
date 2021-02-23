export default {
	resetCheckbox(checkboxes) {
		checkboxes.forEach((checkbox) => (checkbox.checked = false));
	},
	resetCheckboxAll(checkbox) {
		checkbox && (checkbox.checked = false);
	},
	resetPanelDistSelected(panels, panelId) {
		// const panelIndex = panels.findIndex(
		// 	(panel) => panel.id === panelId
		// );
		// panels[panelIndex].distSelected = false;
		console.log(panels);
		console.log(panelId);
	}

}