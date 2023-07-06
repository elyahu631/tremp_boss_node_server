// import Joi from 'joi';
// import Tremp from './TrempModel';

// export function validateTremp(tremp: Tremp): boolean {
//     const schema = Joi.object({
//       creator_id: Joi.string().required(),
//       group_id: Joi.string().required(),
//       tremp_type: Joi.string().required(),
//       create_date: Joi.date().iso().required(),
//       tremp_time: Joi.date().iso().required(),
//       from_root: Joi.object({
//         name: Joi.string().required(),
//         coordinates: Joi.object({
//           latitude: Joi.number().required(),
//           longitude: Joi.number().required(),
//         }).required(),
//       }).required(),
//       to_root: Joi.object({
//         name: Joi.string().required(),
//         coordinates: Joi.object({
//           latitude: Joi.number().required(),
//           longitude: Joi.number().required(),
//         }).required(),
//       }).required(),
//       note: Joi.string().optional(),
//       seats_amount: Joi.number().integer().required(),
//       users_in_tremp: Joi.array().items(
//         Joi.object({
//           user_id: Joi.string().required(),
//           is_approved: Joi.string().required(),
//         })
//       ).required(),
//       is_full: Joi.boolean().required(),
//       chat_id: Joi.string().required(),
//       active: Joi.string().required(),
//       deleted: Joi.boolean().required(),
//     });

//     const { error } = schema.validate(tremp);
//     if (error) {
//       console.log('====================================');
//       console.log(error.details[0].message);
//       console.log('====================================');
//       return false;
//     }
//     return true;
// }
