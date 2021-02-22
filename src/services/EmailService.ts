import User from '../models/UserModel';
import config from '../../config'
import fetch from 'node-fetch'

/**
 * 
 * @param {User} user 
 * @returns {String}
 */
const getActivationURL = (user: User) => {
    return config.activationURL.replace('{{activationCode}}', String(user.getCredentials().getActivationCode()));
}
/**
 * 
 * @param {User} user 
 * @returns {Promise}
 */
export const sendNewUser = (user: User) => {
    return sendEmail('New user', user, { activationURL: getActivationURL(user) });

}

/**
 * 
 * @param {User} user 
 * @returns {Promise}
 */
export const sendNewEmail = (user: User) => {
    return sendEmail('User new email', user, { activationURL: getActivationURL(user) });
}

/**
 * 
 * @param {String} templateName 
 * @param {User} user 
 * @param {Object} user 
 * @returns {Promise}
 */
const sendEmail = (templateName: String, user: User, variables: object) => {
    const body: any = {
        'recepient': {
            'userId': user.getKey(),
            'email': user.getEmail(),
            'name': user.getName() + " " + user.getFamilyName(),
        },
        'templateName': templateName,
        'locale': user.getLocale()
    }
    if (variables) {
        body.variables = variables;
    }
    return getSysToken()
        .then((token: String) => {
            return post(config.emailService, body, token)
        })
        .then((response: any) => {
            if (response.status !== 204) {
                console.log(response);
                console.log(response.body);
                throw new Error('error occured while sending email')
            }

            return response;
        });
}

const post = (url: string, data: object, token: String | null = null) => {

    const headers: any = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    return fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            redirect: 'error',
            body: JSON.stringify(data)
        });
}

const getSysToken = (): Promise<String> => {
    //moze caching?
    const url = config.sso + '/auth/sysLogin';
    return post(url, config.sysAuth)
        .then((response: any) => {
            if (response.headers.get('content-type') == 'text/html; charset=utf-8') {
                return response.text();
            }
            return response.json();

        })
        .then((token: String) => {
            if (token.constructor === String) {
                return token;
            }

            console.log(token);
            throw new Error('Error');
        })

}