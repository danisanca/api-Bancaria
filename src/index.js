const {v4: uuidv4} = require('uuid')
const express = require('express');
const app = express();

app.use(express.json());

const customers =[];

//middleware
function VerifyIfExistsAcountCPF(request,response,next){
    const {cpf} = request.headers;
    const customer = customers.find(customer => customer.cpf === cpf);
    
    if(!customer){
    return response.status(400).json({error: "Customer not found"})
    }
    request.customer = customer;
    return next();
    
    
}


//Criar Conta
app.post("/account",(request,response) =>{
    const {cpf, name} = request.body;

    const customerAlreadyExists = customers.some(
        (customer) =>customer.cpf === cpf
    );
        if(customerAlreadyExists){
            return response.status(400).json({error:"Customer alredy exists!"})
        }
        else{
            customers.push({
                cpf,
                name,
                id: uuidv4(),
                statement:[]
            });
            return response.status(201).send();
        }
    
});

//Buscar Extrato
app.get("/statement",VerifyIfExistsAcountCPF,(request,response) => {
    const {customer} = request
    return response.json(customer.statement);

})

//Cria um deposito
app.post("/deposit",VerifyIfExistsAcountCPF,(request,response)=>{
const {description, amount} = request.body;
const {customer} = request;

const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type:'Credit'
}

customer.statement.push(statementOperation);

return response.status(201).send();
})

//Buscar Extrato
app.get("/statement/date",VerifyIfExistsAcountCPF,(request,response) => {
    const {customer} = request;
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString()
    );

    return response.json(customer.statement);

})

//Configurando inicializaçao. Ultima aula "5"
app.listen(3333)