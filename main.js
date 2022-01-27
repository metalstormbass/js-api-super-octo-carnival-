const axios = require('axios');
const minimist = require('minimist');


// V3 API Root
const v3_config = {
    baseURL: 'https://api.snyk.io/v3',
    headers: {'Authorization': 'token '+process.env.SNYK_TOKEN}
}

// Parse Arguments
var args = minimist(process.argv.slice(2));

// GET PROJECTS
const getProjects = async (args) => {
    try {
     return await axios.get(`/orgs/${args['org']}/projects?version=2021-12-09~experimental&limit=100`, v3_config)
    } catch (error) {
        console.error(error)
      }
    }

// GET ISSUES
const getIssues = async (args, projectArray) => {
    
    var issuesArray = [];
        try {
            const issue = await axios.get(`/orgs/${args['org']}/issues?project_id=${projectArray[x]['id']}&version=2021-08-20~experimental`, v3_config)
                
            if (issue.data['data'] != ""){
                issuesArray.push(issue.data)
                //console.log(issue.data)
            }
        } catch (error) {
               console.error(error)
             }
        return issuesArray
    }

// PARSE JSON FUNCTION
const parseJSON = (projects) => {
    return new Promise(resolve => {
        setTimeout(() => 
        resolve(JSON.parse(projects))
        )
    })
}

// BUILD PROJECT ARRAY FUNCTION
const buildArray = (projectJSON) => {
    var projectArray = [];
    for(var x in projectJSON['data']){
    if (projectJSON['data'][x]['attributes']['type'] == 'sast') { 
    projectArray.push({'name': projectJSON['data'][x]['attributes']['name'], 'id' :projectJSON['data'][x]['id']})

        }
    }
    return projectArray
}

// MAIN FUNCTION
const main = async () => {
    
    // Date Information
    var now = new Date();
    console.log(now.toUTCString())

    // Get Projects
    const projects = (await getProjects(args)).data
    
    // Define Variables
    var projectArray = [];
    var issuesArray = [];
    
    // Get Project ID
    if (projects) {
        const projectJSON = await parseJSON(JSON.stringify(projects))
        projectArray = buildArray(projectJSON)
       
    }

    // Loop Through Projects to Get Issues

    for (x in projectArray) {
    issuesArray = await getIssues(args, projectArray)
    console.log(projectArray[x]['name'])
    if (issuesArray[0] != null){
        for (x in issuesArray[0]['data']) {
        console.log(issuesArray[0]['data'][x]['attributes']['title']) 
        }
     } else {
         console.log("This project has no issues")
     }
     console.log('-----------------------------------')
   }
}

console.log("Snyk Code Issues")
main()
