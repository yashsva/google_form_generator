const morgan = require('morgan');
const express = require('express');
const path = require('path');
const google = require('@googleapis/forms');
const gdrive = require('@googleapis/drive');
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


auth_middleware =async (req,res,next)=>{
    if(o_auth) return next();

    o_auth = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI,
    );

    const auth_url = o_auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/drive',
        state: JSON.stringify({redirect_path:req.originalUrl})  
    })

    return res.redirect(auth_url);

}


app.get('/generate_sample_form', (req, res) => {
    my_form = require('./sample_form_request').sample_form;
    res.redirect('/form')
})

app.get('/form',auth_middleware,async (req,res)=>{
    try {
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
        // console.log(updated_form_res.data.form);
        res.render('success', {
            gform_link: updated_form_res.data.form.responderUri,
        })
        

    } catch (error) {
        console.log(error);
        res.render('failure');
    }
})

app.post('/generate_form',(req,res)=>{
    try {
        console.log(req.body);
        if(!req.body.info || !req.body.form_body) throw Error('Arguments Missing.');
        my_form={
            info:req.body.info,
            form_body:req.body.form_body,
        }
        return res.redirect('/form');

    } catch (error) {
        console.log(error);
        // res.render('failure');
        res.send('Failure !!');
    }
})


app.get('/oauth2callback', async (req, res) => {

    try {
        const code = req.query.code;
        const {redirect_path}=JSON.parse(req.query.state);
        // console.log(JSON.parse(req.query.state));
        if (code) {
            const r = await o_auth.getToken(code)
            o_auth.setCredentials(r.tokens);
            // console.log(r.tokens);

            return res.redirect(redirect_path);

        }

    } catch (error) {
        console.log(error);
        res.render('failure');
    }
    
    
    // console.log(code);
})

app.get('/get_all_forms',auth_middleware,async (req,res)=>{
    try {
        const drive=gdrive.drive({
            version:'v3',
            auth:o_auth,
        });
    
        const {data:{files}}=await drive.files.list({
            q:'mimeType=\'application/vnd.google-apps.form\'',
            fields:'files(name,createdTime,modifiedTime,webViewLink)',
        });
    
        // console.log(files);
        res.json(files);
        
    } catch (error) {
        console.log(error);
        res.send('failure');
        
    }
})


app.get('/', (req, res) => {

    return res.render('home');
})

port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port : ${port}`);
})