const morgan = require('morgan');
const express = require('express');
const path = require('path');
const google = require('@googleapis/forms');
const { OAuth2Client } = require('google-auth-library');
const fs=require('fs');

require('dotenv').config();

let o_auth=null;
let my_form = require('./sample_form_request').sample_form;

// fs.writeFileSync("sample_form_request.json", JSON.stringify(my_form), "utf-8");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json())
app.use(morgan('dev'));     //logging requests
app.use(express.static(path.join(__dirname, 'public')));


app.get('/success', (req, res) => {
    res.render('success', {
        gform_link: '',
    });
})

app.get('/failure', (req, res) => {
    res.render('failure');
})



function get_oauth_url(){
    if(!o_auth){

        o_auth = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI,
        );
    }

    const auth_url = o_auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/drive',
    })

    return auth_url;
}

app.post('/generate_form',(req,res)=>{
    try {
        console.log(req.body);
        if(!req.body.info || !req.body.form_body) throw Error('Arguments Missing.');
        my_form={
            info:req.body.info,
            form_body:req.body.form_body,
        }
        return res.send({oauth_url:get_oauth_url()});

    } catch (error) {
        console.log(error);
        // res.render('failure');
        res.send('Failure !!');
    }
})

app.get('/generate_sample_form', (req, res) => {

    return res.redirect(get_oauth_url());
})

app.get('/oauth2callback', async (req, res) => {

    try {
        const code = req.query.code;
        if (code) {
            const r = await o_auth.getToken(code)
            o_auth.setCredentials(r.tokens);
            // console.log(r.tokens);

            const forms = google.forms({
                version: 'v1',
                auth: o_auth,
            })

            const forms_res = await forms.forms.create({
                requestBody: { info: my_form.info },
            })


            const updated_form_res = await forms.forms.batchUpdate({
                formId: forms_res.data.formId,
                requestBody:my_form.form_body,
                
            })

            // console.log(forms_res.data);
            console.log(updated_form_res.data.form);
            res.render('success', {
                gform_link: updated_form_res.data.form.responderUri,
            })
        }

    } catch (error) {
        console.log(error);
        res.render('failure');
    }


    // console.log(code);
})

app.get('/', (req, res) => {

    return res.render('home');
})

port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port : ${port}`);
}) 