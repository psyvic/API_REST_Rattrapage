const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number().integer().min(1).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    // key: Joi.string().regex(/^[_]{2}\S*[_]{2}$/).min(5).max(190).error((errors) => {
    key: Joi.string().max(190).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    lang_id: Joi.string().regex(/^[a-zA-Z]+$/).min(2).max(5).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    value : Joi.string().min(1).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    authorization : Joi.string().min(1).max(255).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    })
})