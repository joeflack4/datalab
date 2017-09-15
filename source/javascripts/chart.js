import network from './network';
import utility from './utility';
import Highcharts from 'highcharts';

const initializeIdHash = (res) => {
  if (typeof(Storage) !== "undefined") {
    const idToLabel = Object.assign(
      {},
      utility.rekeyHash(
        utility.flattenHash(res.indicatorCategories, 'indicators'),
        { key: 'id', value: 'label.id' }
      ),
      utility.rekeyHash(
        utility.flattenHash(res.characteristicGroupCategories, 'characteristicGroups'),
        { key: 'id', value: 'label.id' }
      ),
      utility.rekeyHash(
        utility.flattenHash(res.surveyCountries, 'geographies'),
        { key: 'id', value: 'label.id' }
      ),
      utility.rekeyHash(
        utility.flattenHash(
          utility.flattenHash(res.surveyCountries, 'geographies'),
          'surveys'
        ),
        { key: 'id', value: 'label.id' }
      )
    );

    localStorage.removeItem('idToLabel');
    localStorage.idToLabel = JSON.stringify(idToLabel);
  } else {
    console.log('Warning: Local Storage is unavailable.');
  }
};

const initializeStrings = (strings) => {
  if (typeof(Storage) !== "undefined") {
    localStorage.removeItem('pma2020Strings', strings);
    localStorage.pma2020Strings = JSON.stringify(strings);
  } else {
    console.log('Warning: Local Storage is unavailable.');
  }
};

const initializeLanguage = (languages) => {
  for(var k in languages) {
    let opt = utility.createNode('option');
    opt.value = k;
    opt.innerHTML = languages[k];
    $('#select-language').append(opt);
  }
};

const initializeCharacteristicGroups = (characteristicGroups) => {
  characteristicGroups.forEach(group => {
    const optGroupName = utility.getString(group);
    let optGroup = utility.createNode('optgroup');

    optGroup.label = optGroupName;

    group.characteristicGroups.forEach(characteristic => {
      let opt = utility.createNode('option');

      opt.value = characteristic.id;
      opt.innerHTML = utility.getString(characteristic);
      optGroup.append(opt);
    });

    $('#select-characteristic-group').append(optGroup);
  });
};

const initializeIndicators = (indicators) => {
  indicators.forEach(group => {
    const optGroupName = utility.getString(group);
    let optGroup = utility.createNode('optgroup');

    optGroup.label = optGroupName;

    group.indicators.forEach(indicator => {
      let opt = utility.createNode('option');

      opt.value = indicator.id;
      opt.innerHTML = utility.getString(indicator);
      optGroup.append(opt);
    });

    $('#select-indicator-group').append(optGroup);
  });
};

const initializeSurveyCountries = (surveyCountries) => {
  const language = utility.getSelectedLanguage();

  surveyCountries.forEach(country => {
    const countryName = utility.getString(country);
    let panelContainer  = utility.createNode('div');

    let panelHeading  = utility.createNode('div');
    let panelTitle  = utility.createNode('div');
    let panelLink  = utility.createNode('a');

    let panelBodyContainer  = utility.createNode('div');
    let panelBody  = utility.createNode('div');

    panelContainer.className = 'panel panel-default';

    panelHeading.className = 'panel-heading';
    panelHeading.setAttribute('role', 'tab');
    panelHeading.id = countryName;

    panelTitle.className = 'panel-title';

    panelLink.href = `#collapse${country["label.id"]}`
    panelLink.setAttribute('role', 'button');
    panelLink.setAttribute('data-toggle', 'collapse');
    panelLink.setAttribute('data-parent', '#accordion');
    panelLink.innerHTML = countryName;

    panelTitle.append(panelLink);
    panelHeading.append(panelTitle);
    panelContainer.append(panelHeading);

    panelBodyContainer.id = `collapse${country["label.id"]}`;
    panelBodyContainer.className = 'panel-collapse collapse';

    panelBody.className = 'panel-body';

    country.geographies.forEach(geography => {
      const geographyName = utility.getString(geography);

      let listHeader = utility.createNode('h4');

      listHeader.innerHTML = geographyName;

      panelBody.append(listHeader);

      geography.surveys.forEach(survey => {
        const surveyName = utility.getString(survey);
        const surveyId = survey["id"];

        let listItem  = utility.createNode('div');
        let surveyInput = utility.createNode('input');

        surveyInput.type = 'checkbox';
        surveyInput.name = surveyId;
        surveyInput.value = surveyId;
        surveyInput.id = surveyId;

        let surveyInputLabel = utility.createNode('label');

        surveyInputLabel.htmlFor = surveyId;
        surveyInputLabel.innerHTML = surveyName;

        listItem.append(surveyInput);
        listItem.append(surveyInputLabel);
        panelBody.append(listItem);
      });
    });

    panelBodyContainer.append(panelBody);
    panelContainer.append(panelBodyContainer);

    $('#countryRoundModal .modal-body').append(panelContainer);
  });
};

const generateTitle = inputs => {
  const characteristicGroupLabel = utility.getStringById(
    utility.getLabelIdFromId(inputs.characteristicGroup)
  );
  const indicatorLabel = utility.getStringById(
    utility.getLabelIdFromId(inputs.indicator)
  );
  const countries = inputs.survey.split(",").map(country => {
    utility.getStringById(
      utility.getLabelIdFromId(country)
    );
  });

  const title = `${indicatorLabel} by ${characteristicGroupLabel} for ${countries.join(", ")}`;

  return { text: title };
};

const generateSeriesName = (countryId, geographyId, surveyId) => {
  const country = utility.getStringById(countryId);
  const geography = utility.getStringById(geographyId);
  const survey = utility.getStringById(surveyId);

  return `${country} ${geography} ${survey}`
};

const generatePlotOptions = () => {
  return {
    series: {
      connectNulls: true,
      marker: { radius: 2 }, // add override when available
    },
    bar: { dataLabels: { enabled: true } },
    column: { dataLabels: { enabled: true } },
    line: { dataLabels: { enabled: true } },
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true
      },
      showInLegend: true
    }
  }
};

const generateSubtitle = () => {
  return {
    style: {
      color: '#000' // styles['title-color']
    },
    text: "PMA2020"
  }
};


const generateCitation = partners => {
  var citation = "Performance Monitoring and Accountability 2020. Johns Hopkins University; <br/>";

  partners.forEach(partner => {
    partner = partners[partner];
    // citation += translate(partner+"_P", labelText) + "; ";
    // if (index % 3 == 0 && index != 0) {
      // citation += "<br/>";
    // }
  });

  citation += " " + new Date().toJSON().slice(0,10);

  return citation;
};

const generateCredits = () => {
  return {
    text: generateCitation({}),
    href: '',
    position: {
      align: 'center',
      y: 10 //-(bottomMargin) + overrides['credits-y-position'] + chartMargin(chartType)
    },
  }
};

const generateXaxis = characteristicGroups => {
  let characteristicGroupsNames = [];

  characteristicGroups.forEach(charGroup => {
    const charGroupName = utility.getStringById(charGroup["characteristic.label.id"]);
    characteristicGroupsNames.push(charGroupName);
  });

  return { categories: characteristicGroupsNames }
};

const generateYaxis = indicatorId => {
  const indicator = utility.getStringById(indicatorId);

  return {
    title: {
      text: indicator
    }
  }
};

const generateExporting = () => {
  return {
    chartOptions: {
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true
          }
        }
      }
    },
    scale: 3,
    fallbackToExportServer: false
  }
};

const generateLegend = () => {
};

const generateSeriesData = dataPoints => (
  dataPoints.reduce((res, dataPoint) => {
    const countryId = dataPoint["country.label.id"];
    const geographyId = dataPoint["geography.label.id"];
    const surveyId = dataPoint["survey.label.id"];

    return [
      ...res,
      {
        name: generateSeriesName(countryId, geographyId, surveyId),
        data: dataPoint.values.reduce((tot, item) => { return [...tot, item.value] }, [])
      }
    ]
  }, [])
);

const generateChart = res => {
  const inputs = res.metadata.queryParameters;
  const characteristicGroups = res.results[0].values;
  const indicatorId = utility.getLabelIdFromId(inputs["indicator"]);
  const dataPoints = res.results;
  const chartType = utility.getSelectedChartType();

  return {
    chart: { type: chartType },
    title: generateTitle(inputs),
    subtitle: generateSubtitle(),
    xAxis: generateXaxis(characteristicGroups),
    yAxis: generateYaxis(indicatorId),
    series: generateSeriesData(dataPoints),
    //credits: generateCredits(),
    // legend: generateLegend(),
    // exporting: generateExporting(),
    // plotOptions: generatePlotOptions(),
  }
};

const initialize = () => {
  network.get("datalab/init").then(res => {
    initializeIdHash(res);
    initializeStrings(res.strings);
    initializeLanguage(res.languages);
    initializeCharacteristicGroups(res.characteristicGroupCategories);
    initializeIndicators(res.indicatorCategories);
    initializeSurveyCountries(res.surveyCountries);

    $('.selectpicker').selectpicker('refresh');
  });
};

const data = () => {
  const selectedSurveys = utility.getSelectedCountryRounds();
  const selectedIndicator = utility.getSelectedValue('select-indicator-group');
  const selectedCharacteristicGroup = utility.getSelectedValue('select-characteristic-group');

  const opts = {
    "survey": selectedSurveys,
    "indicator": selectedIndicator,
    "characteristicGroup": selectedCharacteristicGroup,
  }

  network.get("datalab/data", opts).then(res => {
    console.log(res);
    const chartData = generateChart(res);
    Highcharts.chart('chart-container', chartData);
  });
};

const setOptionsDisabled = (type, availableValues) => {
  if (availableValues) {
    const availableItems = $(`#select-${type}-group option`);

    availableItems.each(item => {
      const itemDomElement = availableItems[item];
      if (!availableValues.includes(itemDomElement.value)) { itemDomElement.disabled = true; }
    });
  }
};

const handleCombos = (opts) => {
  network.get("datalab/combos", opts).then(res => {
    setOptionsDisabled('characteristic', res['characteristicGroup.id']);
    setOptionsDisabled('indicator', res['indicator.id']);

    $('.selectpicker').selectpicker('refresh');
  });
};

const surveyCombo = () => {
  const opts = { survey: utility.getSelectedCountryRounds() }
  handleCombos(opts);
};

const indicatorCombo = () => {
  const opts = { indicator: utility.getSelectedValue('select-indicator-group') }
  handleCombos(opts);
};

const characteristicGroupCombo = () => {
  const opts = { characteristicGroup: utility.getSelectedValue('select-characteristic-group') }
  handleCombos(opts);
};

const chart = {
  initialize,
  data,
  surveyCombo,
  indicatorCombo,
  characteristicGroupCombo,
};

export default chart;
