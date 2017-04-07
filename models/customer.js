"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    timestamps = require('mongoose-timestamp'),
    versioner = require('mongoose-versioner'),
    //		mongoosastic = require('mongoosastic'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId;

var DataTable = require('mongoose-datatable');


DataTable.configure({ verbose: false, debug: false });
mongoose.plugin(DataTable.init);

var Dict = INCLUDE('dict');

var getUrl = function(url) {
    if (!url)
        return "";

    var data = url.substring(0, 4);
    data = data.toLowerCase();
    if (data == 'http')
        return url;
    else
        return "http://" + url;
};

var addressSchema = new Schema({
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' },
    name: { type: String, trim: true, uppercase: true, default: '' },
    Status: { type: String, default: 'ENABLE' }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

var statusAddressList = {};
Dict.dict({ dictName: 'fk_user_status', object: true }, function(err, doc) {
    if (err) {
        console.log(err);
        return;
    }
    statusAddressList = doc;
});


addressSchema.virtual('status')
    .get(function() {
        var res_status = {};

        var status = this.Status;

        if (status && statusAddressList.values[status] && statusAddressList.values[status].label) {
            //console.log(this);
            res_status.id = status;
            res_status.name = statusAddressList.values[status].label;
            res_status.css = statusAddressList.values[status].cssClass;
        } else { // By default
            res_status.id = status;
            res_status.name = status;
            res_status.css = "label-default";
        }
        return res_status;

    });

/**
 * @module Customer
 * @class Customer
 *
 * @property {String} type - Type of __Customer__, proper values are: _'Person'_, _'Company'_
 *
 * @property {Boolean} isOwn - Determine is a ___Person___ or ___Company___ our own. Actually now is not needed
 *
 * @property {Object} name
 * @property {String} name.first - First `name` of Customer
 * @property {String} name.last - Last `name` of Customer
 *
 * @property {Date} dateBirth - Date of Birth, expect ISO string, example `'1998-07-28 17:12:26'`
 *
 * @property {String} imageSrc - `base64` representation of avatar
 *
 * @property {String} email - Email
 *
 * @property {String} company - if type of _Customer_=__'Person'__ should determine __Company__ which from __Person__, can be empty
 *
 * @property {Object} address - `Address` of _Customer_
 * @property {String} address.street - Address `street` of _Customer_
 * @property {String} address.city - Address `city` of _Customer_
 * @property {String} address.state - Address `state` of _Customer_
 * @property {String} address.zip - Address `zip` of _Customer_
 * @property {String} address.country - Address `country` of _Customer_
 *
 * @property {String} website - Website
 *
 * @property {String} jobPosition
 *
 * @property {String} skype - Skype login
 *
 * @property {Object} phones - `Phones` of _Customer_
 * @property {String} phones.mobile - `mobile` of _Customer_
 * @property {String} phones.phone - `phone` of _Customer_
 * @property {String} phones.fax - `fax` of _Customer_
 *
 * @property {Object} salesPurchases - Sales & Purchases options
 * @property {Boolean} salesPurchases.isCustomer
 * @property {Boolean} salesPurchases.isSupplier
 * @property {String} salesPurchases.salesPerson
 * @property {String} salesPurchases.implementedBy
 * @property {String} salesPurchases.reference
 * @property {String} salesPurchases.language
 *
 * @property {Object} social - Social lincs of  _Customer_
 * @property {String} social.FB
 * @property {String} social.LI
 *
 * @property {String} whoCanRW
 *
 * @property {Object} groups - `Groups` of _Customer_
 * @property {String} groups.users
 * @property {String} groups.group
 *
 * @property {Object} editedBy
 * @property {String} editedBy.users - Edited by user
 * @property {Date} editedBy.date - Edited on date
 *
 * @property {Object} companyInfo - Information about company
 * @property {String} companyInfo.size
 * @property {String} companyInfo.industry
 *
 * @property {Object} createdBy
 * @property {String} createdBy.users - Created by user
 * @property {Date} createdBy.date - Creation date
 *
 * @property {Array} history
 *
 * @property {Array} attachments - Some files
 *
 * @property {String} internalNotes - Some notes
 *
 * @property {String} notes - Some notes
 *
 * @property {String} title
 *
 * @property {Array} contacts - Contacts
 *
 * @property {String} timezone - Default time zone 'UTC'
 *
 * @property {String} department - Department of _Customer_
 *
 * @property {String} company - Company of _Customer_
 */


var customerSchema = new Schema({

    isremoved: Boolean,
    type: { type: String, default: 'Company', enum: ['Person', 'Company'] },
    isOwn: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },

    name: {
        civilite: String, // DICT civilite
        first: { type: String, tirm: true, default: '' },
        last: { type: String, trim: true, uppercase: true, default: 'DEMO' } // Company name
    },

    Status: { type: String, default: 'ST_NEVER' }, // TODO virtual

    dateBirth: Date,

    imageSrc: {
        type: String,
        default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAAEaElEQVRYw82X6XLbNhCA+f4PVomk5MRyHDtp63oEgDcl3vfRBQhQIEVKSvsnO+OxRBEfFnthV+n/pyi/NaCryzzL8rJu/wOgzQPXJBgjhDExnXPW/Aqgy30DI0yIwYQQ4Bhe2j0I6BIbI1jL9meC2TdkRu0jgMxCGN5H2HT8IIzjKPAdE9NngEjuAhqfv3rOpe3aIrDAFoB1qtuA3ADlMXKuz9vlLqZokt4CxPAOQXa2bPDCRVSJYB0QIDA4ibp+TVKDbuCvAeh6YpX9DWkcUGJCkAARXW9UfXeL0PmUcF4CZBA4cALv5nqQM+yD4mtATQMOGMi9RzghiKriCuBiAzsB1e8uwUUGtroZIAEsqfqHCI2JjdGZHNDSZzHYb0boQK4JOTVXNQFEoJXDPskEvrYTrJHgIwOdZEBrggXzfkbo+sY7Hp0Fx9bUYbUEAAtgV/waHAcCnOew3arbLy5lVXGSXIrKGQkrKKMLcnHsPjEGAla1PYi+/YCV37e7DRp1qUDjwREK1wjbo56hezRoPLxt9lzUg+m96Hvtz3BMcU9syQAxKBSJ/c2Nqv0Em5C/97q+BdGoEuoORN98CkAqzsAAPh690vdv2tOOEcx/dodP0zq+qjpoQQF7/Vno2UA0OgLQQbUZI6t/1+BlRgAlyywvqtNXja0HFQ7jGVwoUA0HUBNcMvRdpW8PpzDPYRAERfmNE/TDuE8Ajis4oJAiUwB2+g+am3YEEmT5kz4HgOdRygHUIPEMsFf/YvXJYoSKbPczQI4HwysSbKKBdk4dLAhJsptrUHK1lSERUDYD6E9pGLsjoXzRZgAIJVaYBCCfA57zMBoJYfV9CXDigHhRgww2Hgngh4UjnCUbJAs2CEdCkl25kbou5ABh0KkXPupA6IB8fOUF4TpFOs5Eg50eFSOBfOz0GYCWoJwDoJzwcjQBfM2rMAjD0CEsL/Qp4ISG/FHkuJ4A9toXv66KomosMMNAuAA6GxOWPwqP64sb3kTm7HX1Fbsued9BXjACZKNIphLz/FF4WIps6vqff+jaIFAONiBbTf1hDITti5RLg+cYoDOxqJFwxb0dXmT5Bn/Pn8wOh9dQnMASK4aaSGuk+G24DObCbm5XzkXs9RdASTuytUZO6Czdm2BCA2cSgNbIWedxk0AV4FVYEYFJpLK4SuA3DrsceQEQl6svXy33CKfxIrwAanqZBA8R4AAQWeUMwJ6CZ7t7BIh6utfos0uLwxqP7BECMaTUuQCoawhO+9sSUWtjs1kA9I1Fm8DoNiCl64nUCsp9Ym1SgncjoLoz7YTl9dNOtbGRYSAjWbMDNPKw3py0otNeufVYN2wvzha5g6iGzlTDebsfEdbtW9EsLOvYZs06Dmbsq4GjcoeBgThBWtRN2zZ1mYUuGZ7axfz9hZEns+mMQ+ckzIYm/gn+WQvWWRq6uoxuSNi4RWWAYGfRuCtjXx25Bh25MGaTFzaccCVX1wfPtkiCk+e6nh/ExXps/N6z80PyL8wPTYgPwzDiAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDExLTAxLTE5VDAzOjU5OjAwKzAxOjAwaFry6QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxMC0xMi0yMVQxNDozMDo0NCswMTowMGxOe/8AAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAAAElFTkSuQmCC'
    },

    emails: [{
        type: { type: String, default: "pro" }, //billing, delivery...
        email: { type: String, lowercase: true, trim: true, default: '' }
    }],
    newsletter: { type: Boolean, default: false }, //newsletter
    sendEmailing: { type: Boolean, default: true }, //sendEmailing
    sendSMS: { type: Boolean, default: true }, //sendSMS
    company: { type: ObjectId, ref: 'Customers', default: null },
    department: { type: ObjectId, ref: 'Department', default: null },
    timezone: { type: String, default: 'UTC' },

    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, uppercase: true, default: 'FRANCE' }
    },

    shippingAddress: [addressSchema], // list of deliveries address
    deliveryAddressId: { type: Schema.Types.ObjectId }, // id of default address in addresses

    url: { type: String, get: getUrl }, //website
    jobPosition: { type: String, default: '' },
    skype: { type: String, default: '' },

    phones: {
        phone: { type: String, set: MODULE('utils').setPhone, default: '' },
        mobile: { type: String, set: MODULE('utils').setPhone, default: '' },
        fax: { type: String, set: MODULE('utils').setPhone, default: '' }
    },

    contacts: { type: Array, default: [] },
    internalNotes: { type: String, default: '' },
    title: { type: String, default: '' },

    salesPurchases: {
        isCustomer: { type: Boolean, default: true },
        isSupplier: { type: Boolean, default: false },
        isSubcontractor: { type: Boolean, default: false }, //fournisseur
        salesPerson: { type: ObjectId, ref: 'Employees', default: null }, //commercial_id
        salesTeam: { type: ObjectId, ref: 'Department', default: null },
        implementedBy: { type: ObjectId, ref: 'Customers', default: null },
        active: { type: Boolean, default: true },
        ref: { type: String, trim: true, uppercase: true, sparse: true, default: '' }, //code_client or code_fournisseur
        language: { type: String, default: 'fr' },
        receiveMessages: { type: Number, default: 0 },
        cptBilling: { type: Schema.Types.ObjectId, ref: 'Customers' },
        priceList: { type: Schema.Types.ObjectId, ref: 'priceList' }, //price_level
        //prospectlevel: { type: String, default: 'PL_NONE' },

        cond_reglement: { type: String, default: 'RECEP' },
        mode_reglement: { type: String, default: 'CHQ' },
        bank_reglement: { type: String },
        VATIsUsed: { type: Boolean, default: true },

        groupOrder: { type: Boolean, default: false }, // 1 bill for many order
        groupDelivery: { type: Boolean, default: true }, // 1 bill for many delivery
        //zonegeo: String,
        rival: [String], //concurrent

        customerAccount: { type: String, set: MODULE('utils').setAccount, trim: true }, //code_compta
        supplierAccount: { type: String, set: MODULE('utils').setAccount, trim: true } //code_compta_fournisseur
    },

    iban: {
        bank: { type: String, uppercase: true, trim: true },
        id: { type: String, set: MODULE('utils').setNoSpace, uppercase: true, trim: true }, //FR76........
        swift: { type: String, set: MODULE('utils').setNoSpace, uppercase: true, trim: true } //BIC / SWIFT
    },

    entity: [{ type: String, trim: true }],

    relatedUser: { type: ObjectId, ref: 'Users', default: null },
    color: { type: String, default: '#4d5a75' },

    social: {
        FB: { type: String, default: '' },
        LI: { type: String, default: '' }
    },

    whoCanRW: { type: String, enum: ['owner', 'group', 'everyOne'], default: 'everyOne' },

    groups: {
        owner: { type: ObjectId, ref: 'Users', default: null },
        users: [{ type: ObjectId, ref: 'Users', default: null }],
        group: [{ type: ObjectId, ref: 'Department', default: null }]
    },

    notes: [{
        note: String,
        title: String,
        task: { type: ObjectId, ref: 'DealTasks', default: null },
        attachment: {},
        datec: { type: Date, default: Date.now },
        author: { type: ObjectId, ref: 'User', default: null },
        css: { type: String, default: "note-info" }
    }],

    attachments: { type: Array, default: [] },
    history: { type: Array, default: [] },

    createdBy: { type: ObjectId, ref: 'Users', default: null },

    editedBy: { type: ObjectId, ref: 'Users', default: null },

    companyInfo: {
        size: { type: String, default: 'EF0' }, // effectif_id
        industry: { type: ObjectId, ref: 'Industries', default: null }, //brand
        idprof1: String, // SIREN
        idprof2: { type: String }, // SIRET
        idprof3: String, // NAF
        idprof4: String,
        idprof5: String,
        idprof6: String, // TVA Intra
        category: { type: Schema.Types.ObjectId, ref: 'accountsCategories' }, //typent_id
        capital: { type: Number, default: 0 },
        importExport: String, // null (no internal country), EUROP (Import/Export in EUROPE), INTER (Import/Export international)
        Tag: { type: [], set: MODULE('utils').setTags }
    },

    contactInfo: {
        soncas: [String],
        hobbies: [String],
        sex: { type: String, default: "H" }
    },

    ID: { type: Number, unique: true },
    integrationId: { type: String, default: '' },
    channel: { type: ObjectId, ref: 'integrations', default: null },

    oldId: String // only use for migration

}, { collection: 'Customer' });

customerSchema.virtual('fullName').get(function() {
    if (this.name.first)
        return this.name.first + ' ' + this.name.last;

    return this.name.last;
});

customerSchema.set('toJSON', { virtuals: true });

customerSchema.pre('save', function(next) {
    var SeqModel = MODEL('Sequence').Schema;
    var EntityModel = MODEL('entity').Schema;
    var self = this;

    // Update first address delivery copy main address
    if (self.shippingAddress && self.shippingAddress.length != 0) {
        self.shippingAddress[0].name = self.address.fullName;
        self.shippingAddress[0].street = self.address.street;
        self.shippingAddress[0].zip = self.address.zip;
        self.shippingAddress[0].city = self.address.city;
        self.shippingAddress[0].country = self.address.country;
    } else
        self.shippingAddress.push({
            name: self.address.fullName,
            street: self.address.street,
            zip: self.address.zip,
            city: self.address.city,
            country: self.address.country,
            Status: 'ENABLE'
        });

    //if (this.code_client == null && this.entity !== "ALL" && this.Status !== 'ST_NEVER') {
    //console.log("Save societe");
    if (!this.ID)
        SeqModel.incCpt("C", function(seq) {
            //self.barCode = "C" + seq;
            self.ID = seq;
            next();
            //console.log(seq);
            /*EntityModel.findOne({ _id: self.entity }, "cptRef", function(err, entity) {
                if (err)
                    console.log(err);

                if (entity && entity.cptRef)
                    self.code_client = entity.cptRef + "-" + seq;
                else
                    self.code_client = "C" + seq;
                next();
            });*/
        });
    else
        next();
});

var statusList = {};
Dict.dict({ dictName: "fk_stcomm", object: true }, function(err, docs) {
    statusList = docs;
});

var prospectLevelList = {};
Dict.dict({ dictName: "fk_prospectlevel", object: true }, function(err, docs) {
    prospectLevelList = docs;
});

var segmentationList = {};
Dict.dict({ dictName: "fk_segmentation", object: true }, function(err, docs) {
    if (docs) {
        segmentationList = docs.values;
    }
});

var tab_attractivity = {
    effectif_id: {
        "EF0": 1,
        "EF1-5": 1,
        "EF6-10": 1,
        "EF11-50": 1,
        "EF51-100": 1,
        "EF101-250": 2,
        "EF251-500": 2,
        "EF501-1000": 3,
        "EF1001-5000": 5,
        "EF5000+": 5
    },
    typent_id: {
        //"TE_PUBLIC": 3,
        "TE_ETABL": 3,
        "TE_SIEGE": 5
    },
    familyProduct: {
        "Externalisation": 5,
        "Imp Num": 4,
        "Repro/plan": 2,
        "Signalétique": 5,
        "Numérisation": 5,
        "Créa, Pao": 2,
        "Dupli cd/dvd": 4
    },
    segmentation: segmentationList,
    poste: {
        "PDG": 5,
        "DG": 4,
        "DET": 4,
        "DIR IMMO": 4,
        "DirCO": 2,
        "Dir COM": 3,
        "DirMktg": 3
    }
};

customerSchema.virtual('attractivity')
    .get(function() {
        var attractivity = 0;

        for (var i in tab_attractivity) {
            if (this[i]) {
                if (tab_attractivity[i][this[i].text])
                    attractivity += tab_attractivity[i][this[i].text];

                else if (tab_attractivity[i][this[i]])
                    attractivity += tab_attractivity[i][this[i]];
            }
        }

        return attractivity;
    });

customerSchema.virtual('status')
    .get(function() {
        var res_status = {};

        var status = this.Status;

        if (status && statusList.values[status] && statusList.values[status].label) {
            //console.log(this);
            res_status.id = status;
            //this.status.name = i18n.t("intervention." + statusList.values[status].label);
            res_status.name = statusList.values[status].label;
            res_status.css = statusList.values[status].cssClass;
        } else { // By default
            res_status.id = status;
            res_status.name = status;
            res_status.css = "";
        }
        return res_status;

    });

/*customerSchema.virtual('prospectLevel')
    .get(function() {
        var prospectLevel = {};

        var level = this.prospectlevel;

        if (level && prospectLevelList.values[level] && prospectLevelList.values[level].cssClass) {
            prospectLevel.id = level;
            prospectLevel.name = i18n.t("companies:" + level);
            if (prospectLevelList.values[level].label)
                prospectLevel.name = prospectLevelList.values[level].label;
            prospectLevel.css = prospectLevelList.values[level].cssClass;
        } else { // By default
            prospectLevel.id = level;
            prospectLevel.name = level;
            prospectLevel.css = "";
        }

        return prospectLevel;
    });*/

customerSchema.virtual('iban.isOk')
    .get(function() {
        var self = this;

        if (self.iban && self.iban.id) {
            var IBAN = require('iban');

            return IBAN.isValid(self.iban.id);
        }

        return null;
    });

customerSchema.virtual('errors')
    .get(function() {
        var errors = [];

        if (!this.cond_reglement)
            errors.push(i18n.t("companies:ErrEmptyReglement"));
        if (!this.mode_reglement)
            errors.push(i18n.t("companies:ErrEmptyCondition"));

        //Check Valid IBAN
        if (this.iban && this.iban.id) {
            var IBAN = require('iban');
            if (!IBAN.isValid(this.iban.id))
                errors.push(i18n.t("companies:ErrIBAN"));
        }

        return errors;
    });

customerSchema.index({ name: 'text', zip: 'text', Tag: 'text' });

customerSchema.plugin(timestamps);

if (CONFIG('storing-files')) {
    var gridfs = INCLUDE('_' + CONFIG('storing-files'));
    customerSchema.plugin(gridfs.pluginGridFs, { root: "Customers" });
}

customerSchema.plugin(versioner, { modelName: 'Customers', collection: 'Customers.Version', mongoose: mongoose });

exports.Schema = mongoose.model('Customers', customerSchema);
exports.name = "Customers";