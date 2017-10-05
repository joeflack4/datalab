const loadStringsFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('pma2020Strings'));
};

const createNode = el => document.createElement(el);

const append = (parent, el) => parent.appendChild(el);

const parseDate = (date) => {
  const splitDate = date.split("-");
  if (splitDate.length === 2) {
    return new Date(splitDate[1], splitDate[0] - 1, 1).getTime();
  } else {
    return new Date(date).getTime();
  }
};

const getDefinition = item => {
  const definitionId = item.dataset.definitionId;
  const itemNameId = item.dataset.labelId;

  if (definitionId && itemNameId) {
    const definition = getStringById(definitionId);
    const itemName = getStringById(itemNameId);
    return `${itemName}: ${definition}`;
  } else {
    return '';
  }
};

const setDefinitionText = () => {
  const selectedIndicator = getSelectedItem('select-indicator-group');
  const selectedCharacteristicGroup = getSelectedItem('select-characteristic-group');

  $(".help-definition.indicator-group").html(getDefinition(selectedIndicator));
  $(".help-definition.characteristic-group").html(getDefinition(selectedCharacteristicGroup));
};

const getSelectedLanguage = () => $('#select-language option:selected').val();

const getString = item => {
  const labelId = item['label.id'];
  return getStringById(labelId);
};

const getStringById = labelId => {
  const strings = loadStringsFromLocalStorage();
  const lang = getSelectedLanguage();
  const string = strings[labelId];
  if (string) {
    const enString = string['en'];
    return string[lang] || enString;
  } else {
    console.log(`No String for "${labelId}"`);
    return false;
  }
};

const getSelectedItem = id => {
  const el = document.getElementById(id);
  const selectedVal = el.options[el.selectedIndex];

  return selectedVal;
}

const getSelectedValue = id => ( getSelectedItem(id).value );
const getSelectedText = id => ( getSelectedItem(id).text );

const getSelectedCountryRounds = () => {
  const countries = [];
  const checkboxes = $("#countryRoundModal input[type=checkbox]:checked");

  checkboxes.map(checkbox => {
    countries.push(checkboxes[checkbox].value);
  });

  return countries;
};

const getSelectedChartType = () => {
  return $("#chart-types label.active input").data("type");
};

const utility = {
  createNode,
  append,
  getSelectedLanguage,
  getString,
  getStringById,
  getSelectedValue,
  getSelectedText,
  getSelectedChartType,
  getSelectedCountryRounds,
  setDefinitionText,
  parseDate,
};

export default utility;
