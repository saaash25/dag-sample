const mongoose = require('mongoose')
const FlowSchema = mongoose.Schema({
    name: { type: String, required: true },
    nodes: [
        {
            type: { type: String, required: true },
            name: { type: String, required: true },
            func: { type: String, default: null },
            parentNode: { type: mongoose.Types.ObjectId, default: null },
            childNodes: [{ child: { type: mongoose.Types.ObjectId, default: null } }],
            branches: [
                {
                    name: { type: String, default: null },
                    type: { type: String, required: true },
                    func: { type: String, default: null },
                    childNodes: [{ child: { type: mongoose.Types.ObjectId, default: null } }]
                }
            ],
            isRootNode:{type:Boolean,default:false}
        }
    ]
}, {
    timestamps: true
})
module.exports = mongoose.model('flows', FlowSchema)