const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const { DBConnect } = require('./Connection/connection')
const FlowModel = require('./Models/Flows')
const { Console } = require('./functions/preDefinedFunctions')
const { GetWheatherData,GetPostalData,ChildCheck } = require('./functions/helperFunctions')
const { ObjectId } = require('mongoose').Types


app.get("/", (req, res) => {
    res.send("working")
})
//CREATE FLOW
app.post("/create-flow", async (req, res) => {
    const flowCount = await FlowModel.countDocuments()
    const flowName = `Flow_${flowCount + 1}`
    const flowObj = new FlowModel({
        name: flowName
    })
    const result = await flowObj.save()
    res.send({ flowid: result.id })
})
//CONSOLE NODE
app.post('/create-console-node', async (req, res) => {
    const flowId = req.body.flowId
    const type = req.body.type
    const flow = await FlowModel.findById(flowId)
    const nodeName = `Node_${flow.nodes.length + 1}`
    const updateFiedls = [
        ...flow.nodes,
        {
            type: type,
            name: nodeName,
            func: Console
        }
    ]
    await FlowModel.updateOne({ _id: flowId }, { nodes: updateFiedls })
    res.send({ message: "console node added" })
})
//CUSTOM FUNCTION  NODE 
app.post('/create-custome-function', async (req, res) => {
    const flowId = req.body.flowId
    const type = req.body.type
    const flow = await FlowModel.findById(flowId)
    const nodeName = `Node_${flow.nodes.length + 1}`
    const functionString = req.body.func
    const updateFiedls = [
        ...flow.nodes,
        {
            type: type,
            name: nodeName,
            func: functionString
        }
    ]
    await FlowModel.updateOne({ _id: flowId }, { nodes: updateFiedls })
    res.send({ message: "custome function node added" })
})
//BRANHCING
app.post('/create-condition-node', async (req, res) => {
    const type = req.body.type
    const branches = req.body.branches || []
    const flowId = req.body.flowId
    const flow = await FlowModel.findById(flowId)
    const nodeName = `Node_${flow.nodes.length + 1}`
    var updateFiedls = []
    const branchArray = branches.length && branches.map((branch, index) => {
        const branchFunction = branch.func
        const childNodeName = `Branch_${index + 1}`
        if (branch.comparisonValue) {
            return {
                name: childNodeName,
                type: branch.name,
                func: branchFunction.replace('{{ comparison_value }}', branch.comparisonValue),
            }
        } else {
            return {
                name: childNodeName,
                type: branch.name,
                func: branchFunction,
            }
        }
    })

    if (branchArray.length) {
        updateFiedls = await Promise.all(branchArray).then(result => {
            return [
                ...flow.nodes,
                {
                    type: type,
                    name: nodeName,
                    func: null,
                    branches: branchArray
                }
            ]
        })
    } else {
        updateFiedls = [
            ...flow.nodes,
            {
                type: type,
                name: nodeName,
                func: null,
                branches: []
            }
        ]
    }
    await FlowModel.updateOne({ _id: flowId }, { nodes: updateFiedls })
    res.send({ message: "condition node added", updateFiedls: updateFiedls })
})
app.patch('/update-parent-node', async (req, res) => {

})
app.patch('/update-child-node', async (req, res) => {

})
//SAMPLE REQUEST
app.post('/get-standard-format', async (req, res) => {
    try {
        const flowId = req.body.flowId
        const flow = await FlowModel.findById(flowId)
        const rootNode = flow.nodes.filter(node => node.isRootNode === true)
        let payload = {}
        if (req.body.type.toLowerCase() === 'weather') {
            const wheatherData = await GetWheatherData()
            payload = wheatherData
        } else if (req.body.type.toLowerCase() === 'postalcode') {
            const postalData = await GetPostalData()
            payload = postalData
        } else {
            payload = req.body
        }
        const data = await ChildCheck(flow.nodes, rootNode[0], payload)
        console.log(data)
        req.body = data.final_out
        return res.send({ "success": true, payload: req.body })
    } catch (error) {
        throw error
    }
})
const main = async (app) => {
    try {
        const result = await DBConnect()
        if (result) {
            app.listen(3000, () => {
                console.log("server running")
            })
        }
    } catch (error) {
        throw error
    }
}
main(app)

