import * as YAML from 'js-yaml';
import axiosCookie from '../axiosCookie';

interface Props {
    scenarioID: string;
}

export default function exportScenario({scenarioID} : Props){
    
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
            const data = await axiosCookie.get(`/scenario/${scenarioID}`);
            let scenario = data.data.data;
            
            // remove __v and all nested ._id field
            delete scenario.__v;
            scenario = removeIds(scenario);

            // re-arrange eventSeries field
            const eventSeriesField:any = Object.values(scenario["eventSeries"]);
            for(const entryObj of eventSeriesField){
                for(const [key, val] of Object.entries(entryObj["event"])){
                    entryObj[key] = val;
                }
                delete entryObj["event"];
            }
            scenario["eventSeries"] = eventSeriesField;
            
            // re-arrange investments field
            const investmentsField = Object.values(scenario["investments"]);
            scenario["investments"] = investmentsField;

            // re-arrange investmentTypes
            const investmentTypesField = Object.values(scenario["investmentTypes"]);
            scenario["investmentTypes"] = investmentTypesField;
            
            JsonToYamlDownloader(scenario)
        }
        catch (err){
            console.error("Error Export Scenario: ", err)
        }
    }

    return (
        <button className="styled-button" style={{height: "30px", width: "120px", cursor: "pointer"}} onClick={handleExport}>
            Download as YAML
        </button>
    )
}