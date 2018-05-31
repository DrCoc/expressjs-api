var soap = require('soap');
var url = 'http://192.168.2.153:7001/Application2-Project1-context-root/MyWebService1Port?WSDL';

module.exports = {
    getEmp: function (req, res) {
        var workerId = req.body.workerId;
        soap.createClient(url, function(err, client) {
            var args = {empNo: workerId};
            console.log(client);
            client.getEmp(args, function(err, result) {
                return res.status(200).json(result);
            });
        });
    }
};

