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
function getBalance(statement){
    const balance = statement.reduce((acc,operation) =>{
        if(operation.type ==="credit"){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    },0);
    return balance;
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
//Atualizar nome da Conta
app.put("/account",VerifyIfExistsAcountCPF,(request,response)=>{
const { name } = request.body;
const { customer } = request;

customer.name = name;

return response.status(201).send();
})

//Buscando dados da conta
app.get("/account",VerifyIfExistsAcountCPF,(request,response)=>{
    const { customer } = request;
    
    return response.json(customer);
})

//Buscando balance da conta
app.get("/balance",VerifyIfExistsAcountCPF,(request,response)=>{
    const { customer } = request;
    
    const baçamce = getBalance(customer.statement)

    return response.json(balance);
})

//Deletar Conta
app.delete("/account", VerifyIfExistsAcountCPF,(request,response) =>{
    const {customer} = request;
    customers.splice(customer,1);
    return response.status(200).json(customers);
})

//Configurando inicializaçao. Ultima aula "5"
app.listen(3333)