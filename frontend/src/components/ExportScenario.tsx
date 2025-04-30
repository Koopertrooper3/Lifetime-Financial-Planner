import * as YAML from 'js-yaml';
import axios from 'axios';

interface Props {
    scenarioID: string;
}

export default function({scenarioID} : Props){
    
    const JsonToYamlDownloader = function(jsonData:any, fileName = "scenario.yaml"){
        const yamlString = YAML.dump(jsonData);
        const blob = new Blob([yamlString], { type: "text/yaml" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    const removeIds = (data:{}) => {
        const jsonString = JSON.stringify(data, (key, value) => 
            key === '_id' ? undefined : value
        );
        return JSON.parse(jsonString);
    };

    const handleExport = async function(){
        try{
            // retrieve the scenario given the scenarioID
            const data = await axios.get(`http://localhost:8000/scenario/${scenarioID}`);
            let scenario = data.data.data;
            
            // remove __v and all nested ._id field
            delete scenario.__v;
            scenario = removeIds(scenario);

            // re-arrange eventSeries field
            const eventSeriesField = Object.values(scenario["eventSeries"]);
            scenario["eventSeries"] = eventSeriesField;
            
            // re-arrange investments field
            const investmentsField = Object.values(scenario["investments"]);
            scenario["investments"] = investmentsField;

            // re-arrange investmentTypes
            const investmentTypesField = Object.values(scenario["investmentTypes"]);
            scenario["investmentTypes"] = investmentTypesField;

            console.log(scenario)
            JsonToYamlDownloader(scenario)
        }
        catch (err){
            console.error("Error Export Scenario: ", err)
        }
    }

    return (
        <button onClick={handleExport}>
            Export Scenario
        </button>
    )
}