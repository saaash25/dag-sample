const axios = require('axios')
const FlowModel = require('../Models/Flows')

let returnObj = {}

exports.GetWheatherData = async (props) => {
    //console.log(`https://fcc-weather-api.glitch.me/api/current?lon=${props && props.lon ? props.lon :77}&lat=${props && props.lat ? props.lat :20}`)
    try {
        // const response = await axios.get(`https://fcc-weather-api.glitch.me/api/current?lon=${props && props.lon ? props.lon :76.11}&lat=${props && props.lat ? props.lat :11.12}`);
        // return response.data
        const sampleResponse = {
            coord: { lon: 76.11, lat: 11.12 },
            weather: [
                {
                    id: 801,
                    main: 'Clouds',
                    description: 'few clouds',
                    icon: 'https://cdn.glitch.com/6e8889e5-7a72-48f0-a061-863548450de5%2F02d.png?1499366021821'
                }
            ],
            base: 'stations',
            main: {
                temp: 27.4,
                feels_like: 29.45,
                temp_min: 27.4,
                temp_max: 27.4,
                pressure: 1010,
                humidity: 69
            },
            visibility: 6000,
            wind: { speed: 3.09, deg: 340 },
            clouds: { all: 20 },
            dt: 1660624146,
            sys: {
                type: 1,
                id: 9209,
                country: 'IN',
                sunrise: 1660610729,
                sunset: 1660655678
            },
            timezone: 19800,
            id: 1263694,
            name: 'Manjeri',
            cod: 200
        }
        return sampleResponse
    } catch (error) {
        throw error
    }
}
exports.GetPostalData = async (props) => {
    try {
        const response = await axios.get(`https://api.zippopotam.us/us/10002`);
        return response.data
    } catch (error) {
        throw error
    }
}
//..........................................................................
// exports.GetStandardizedPayload = (req) => {
//     try {
//         return async function (req, res, next) {
//             const flowId = req.body.flowId
//             const flow = await FlowModel.findById(flowId)
//             const rootNode = flow.nodes.filter(node => node.isRootNode === true)
//             let payload = {}
//             if (req.body.type.toLowerCase() === 'weather') {
//                 const wheatherData = await GetWheatherData()
//                 payload = wheatherData
//             } else if (req.body.type.toLowerCase() === 'postalcode') {
//                 const postalData = await GetPostalData()
//                 payload = postalData
//             } else {
//                 payload = req.body
//             }
//             const data = await ChildCheck(flow.nodes, rootNode[0], payload)
//             req.body = data.final_out
//             console.log(req.body)
//             next()
//         }
//     } catch (error) {
//         throw error
//     }
// }

exports.ChildCheck = async (nodeList, node, payload) => {
    try {
        if (node.func) {
            const func = await this.CreateFunction(node.func)
            returnObj = await this.ExecuteFunctions(func, payload)
        }
        //For Branch Node there is no child nodes availble
        //For Nodes having child nodes , no branches available
        if (node.childNodes.length) {
            const childNode = await this.GetChild(nodeList, node.childNodes[0].child)
            await this.ChildCheck(nodeList, childNode[0], payload)
        }
        else if (node.branches.length) {
            const branch = await this.ChooseCorrectBranch(node.branches, payload)
            const childNode = await this.GetChild(nodeList, branch.childNodes[0].child)
            await this.ChildCheck(nodeList, childNode[0], payload)

        }
        return returnObj
    } catch (error) {
        throw error
    }
}
exports.CreateFunction = (functionString) => {
    try {
        return eval(functionString)
    } catch (error) {
        throw error
    }
}
exports.ExecuteFunctions = async (func, payload) => {
    try {
        if (func.constructor.name === 'AsyncFunction') {
            payload = await func(payload)
        } else {
            payload = func(payload)
        }
        return payload
    } catch (error) {
        throw error
    }
}
exports.GetChild = async (nodeList, childNodeId) => {
    try {
        return nodeList.filter(node => node._id.toString() === childNodeId.toString())
    } catch (error) {
        throw error
    }
}
exports.ChooseCorrectBranch = async (branches, payload) => {
    try {
        const branchCount = branches.length
        let i = 0
        let condition = false
        while (condition === false) {
            const func = this.CreateFunction(branches[i].func)
            const result = await this.ExecuteFunctions(func, payload)
            if (result) {
                condition = result
                return branches[i]
            }
            i++
        }
        return condition
    } catch (error) {
        throw error
    }
}
