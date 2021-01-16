const User = require('../models/userModel');
const config = require('../config');
const fetch = require('node-fetch');


/**
 * 
 * @param {User} user 
 * @returns {String}
 */
const getActivationURL = (user) => {
    return config.activationURL.replace('{{activationCode}}', user.credentials.activationCode);
}
/**
 * 
 * @param {User} user 
 * @returns {Promise}
 */
exports.sendNewUser = (user) => {
    return sendEmail('New user', user, { activationURL: getActivationURL(user) });

}

/**
 * 
 * @param {User} user 
 * @returns {Promise}
 */
exports.sendNewEmail = (user) => {
    return sendEmail('User new email', user, { activationURL: getActivationURL(user) });
}

/**
 * 
 * @param {String} templateName 
 * @param {User} user 
 * @param {Object} user 
 * @returns {Promise}
 */
const sendEmail = (templateName, user, variables) => {
    const body = {
        'recepient': {
            'userId': user._id.toString(),
            'email': user.email,
            'name': user.longName,
        },
        'templateName': templateName,
        'locale': user.locale
    }
    if (variables) {
        body.variables = variables;
    }
    return getSysToken()
        .then(token => {
            return post(config.emailService, body, token)
        })
        .then((response) => {
            if (response.status !== 204) {
                console.log(response);
                console.log(response.body);
                throw new Error('error occured while sending email')
            }

            return response;
        });
}

const post = (url, data, token = null) => {

    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    return fetch(
        url,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers,
            redirect: 'error',
            body: JSON.stringify(data)
        });
}

const getSysToken = () => {
    //moze caching?
    const url = config.sso + '/auth/sysLogin';
    return post(url, config.sysAuth)
        .then(response => {
            if (response.headers.get('content-type') == 'text/html; charset=utf-8') {
                return response.text();
            }
            return response.json();

        })
        .then(token => {
            if (token.constructor === String) {
                return token;
            }

            console.log(token);
            throw new Error('Error');
        })

}