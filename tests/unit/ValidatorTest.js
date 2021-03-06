'use strict';

const Jii = require('../../index');
const FakeValidationModel = require('../models/FakeValidationModel');
const BooleanValidator = require('../../validators/BooleanValidator');
const CompareValidator = require('../../validators/CompareValidator');
const DateValidator = require('../../validators/DateValidator');
const DefaultValueValidator = require('../../validators/DefaultValueValidator');
const EmailValidator = require('../../validators/EmailValidator');
const FilterValidator = require('../../validators/FilterValidator');
const InlineValidator = require('../../validators/InlineValidator');
const RequiredValidator = require('../../validators/RequiredValidator');
const SafeValidator = require('../../validators/SafeValidator');
const StringValidator = require('../../validators/StringValidator');
const UrlValidator = require('../../validators/UrlValidator');
const NumberValidator = require('../../validators/NumberValidator');
const RangeValidator = require('../../validators/RangeValidator');
const RegularExpressionValidator = require('../../validators/RegularExpressionValidator');
const UnitTest = require('../../base/UnitTest');
require('../bootstrap');
class self extends UnitTest {

    _assertValidation(test, validator, values, hasErrors) {
        var model = new FakeValidationModel();

        values.forEach(function (value) {
            model.set('foo', value);
            model.clearErrors();

            // Attribute
            validator.validateAttribute(model, 'foo');
            test.strictEqual(model.hasErrors(), hasErrors, 'Attribute errors: ' + model.getErrors('foo'));

            // Value
            test.strictEqual(validator.validateValue(value), !hasErrors, validator.className() + ': Value error, value: ' + value);
        });
    }

    _assertTrue(test, validator, values) {
        this._assertValidation(test, validator, values, false);
    }

    _assertFalse(test, validator, values) {
        this._assertValidation(test, validator, values, true);
    }

    booleanValidatorTest(test) {
        var validator = new BooleanValidator();
        this._assertTrue(test, validator, [
            true,
            false,
            1,
            0,
            '1',
            '0'
        ]);
        this._assertFalse(test, validator, [
            'text..',
            [],
            null
        ]);
        validator.strict = true;
        this._assertTrue(test, validator, [
            '1',
            '0'
        ]);
        this._assertFalse(test, validator, [
            true,
            false,
            1,
            0,
            'text..',
            [],
            null
        ]);

        test.done();
    }

    compareValidatorTest(test) {
        var model = new FakeValidationModel();
        model.set('foo', 'test');

        // Attribute
        var validator = new CompareValidator();
        validator.compareAttribute = 'bar';
        model.set('bar', 'test');
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors(), false);

        var validator = new CompareValidator();
        validator.compareAttribute = 'bar';
        model.set('bar', 'test222');
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors(), true);

        // Value
        validator.compareValue = 'test';
        test.strictEqual(validator.validateValue('test'), true);
        validator.compareValue = 'test222';
        test.strictEqual(validator.validateValue('test'), false);

        test.done();
    }

    dateValidatorTest(test) {
        var validator = new DateValidator();
        this._assertTrue(test, validator, ['2013-03-04']);
        this._assertFalse(test, validator, ['text..']);

        var model = new FakeValidationModel();
        model.set('foo', '2013-03-04');
        validator.timestampAttribute = 'bar';
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.get('bar'), 1362355200);

        test.done();
    }

    defaultValueValidatorTest(test) {
        var model = new FakeValidationModel();
        model.set('foo', 'test');

        var validator = new DefaultValueValidator();
        validator.value = 'test222';
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.get('foo'), 'test');

        model.set('foo', null);
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.get('foo'), 'test222');

        test.done();
    }

    emailValidatorTest(test) {
        var validator = new EmailValidator();
        this._assertTrue(test, validator, ['test@example.com']);
        this._assertFalse(test, validator, ['text..']);

        test.done();
    }

    filterValidatorTest(test) {
        var model = new FakeValidationModel();
        var validator = new FilterValidator({
            filter: function (value) {
                return value * 2;
            }
        });

        model.set('foo', 5);
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.get('foo'), 10);

        test.done();
    }

    inlineValidatorTest(test) {
        var model = new FakeValidationModel();
        model.checkFoo = function (attribute, params) {
            test.strictEqual(params.param1, 'value1');
            this.addError(attribute, 'test error');
        };
        var validator = new InlineValidator({
            method: 'checkFoo',
            params: {
                param1: 'value1'
            }
        });

        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors('foo'), true);

        test.done();
    }

    numberValidatorTest(test) {
        var validator;

        validator = new NumberValidator();
        this._assertTrue(test, validator, [
            20,
            0,
            -20,
            '20',
            25.45
        ]);
        this._assertFalse(test, validator, [
            '25,45',
            '12:45'
        ]);

        validator.integerOnly = true;
        this._assertTrue(test, validator, [
            20,
            0,
            -20,
            '20',
            '020',
            20
        ]);
        this._assertFalse(test, validator, [
            25.45,
            '25,45',
            '0x14'
        ]);

        validator = new NumberValidator({
            min: -10,
            max: 5
        });
        this._assertTrue(test, validator, [
            -10,
            -3,
            0,
            3,
            5
        ]);
        this._assertFalse(test, validator, [
            -11,
            6,
            100
        ]);

        test.done();
    }

    rangeValidatorTest(test) {
        var validator = new RangeValidator({
            range: [
                1,
                2,
                'test'
            ]
        });
        this._assertTrue(test, validator, [
            1,
            2,
            '1',
            '2',
            'test'
        ]);
        this._assertFalse(test, validator, [
            3,
            'text..'
        ]);

        validator.strict = true;
        this._assertTrue(test, validator, [
            1,
            2,
            'test'
        ]);
        this._assertFalse(test, validator, [
            '1',
            '2',
            'text..'
        ]);

        validator.not = true;
        this._assertTrue(test, validator, [
            '1',
            '2',
            'text..'
        ]);
        this._assertFalse(test, validator, [
            1,
            2,
            'test'
        ]);

        test.done();
    }

    regularExpressionValidatorTest(test) {
        var validator = new RegularExpressionValidator({
            pattern: /^[a-z]+[0-9]$/
        });
        this._assertTrue(test, validator, [
            'aaa4',
            'a1'
        ]);
        this._assertFalse(test, validator, [
            'qwe123',
            'bbb'
        ]);

        validator.not = true;
        this._assertFalse(test, validator, [
            'aaa4',
            'a1'
        ]);
        this._assertTrue(test, validator, [
            'qwe123',
            'bbb'
        ]);

        test.done();
    }

    requiredValidatorTest(test) {
        var model = new FakeValidationModel();
        var validator = new RequiredValidator();

        model.set('foo', 'text..');
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors('foo'), false);

        model.set('foo', null);
        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors('foo'), true);

        test.done();
    }

    safeValidatorTest(test) {
        var model = new FakeValidationModel();
        var validator = new SafeValidator();

        validator.validateAttribute(model, 'foo');
        test.strictEqual(model.hasErrors(), false);

        test.done();
    }

    stringValidatorTest(test) {
        var validator;

        validator = new StringValidator({
            length: 4
        });
        this._assertTrue(test, validator, [
            'aaaa',
            '\u20AC\u20AC\u20AC\u20AC'
        ]);
        this._assertFalse(test, validator, [
            'aa',
            'q'
        ]);

        validator = new StringValidator({
            length: [4]
        });
        this._assertTrue(test, validator, [
            'aaaa',
            'aaabbb'
        ]);
        this._assertFalse(test, validator, [
            'aa',
            ''
        ]);

        validator = new StringValidator({
            length: [
                1,
                5
            ]
        });
        this._assertTrue(test, validator, [
            'a',
            'aa',
            'aaaaa'
        ]);
        this._assertFalse(test, validator, [
            '',
            'aaabbb'
        ]);

        validator = new StringValidator({
            length: [
                3,
                8
            ],
            min: 1,
            max: 5
        });
        this._assertTrue(test, validator, [
            'aaa',
            'aaaabbbb'
        ]);
        this._assertFalse(test, validator, [
            '',
            'aa'
        ]);

        test.done();
    }

    urlValidatorTest(test) {
        var validator;

        validator = new UrlValidator();
        this._assertTrue(test, validator, [
            'http://google.de',
            'https://google.de',
            'https://www.google.de/search?q=yii+framework&ie=utf-8&oe=utf-8&rls=org.mozilla:de:official&client=firefox-a&gws_rd=cr'
        ]);
        this._assertFalse(test, validator, [
            'google.de',
            'htp://yiiframework.com',
            'ftp://ftp.ruhr-uni-bochum.de/',
            'http://invalid,domain',
            'http://äüö?=!"\xA7$%&/()=}][{\xB3\xB2\u20AC.edu'
        ]);

        validator = new UrlValidator({
            defaultScheme: 'https'
        });
        this._assertTrue(test, validator, [
            'yiiframework.com',
            'http://yiiframework.com'
        ]);

        test.done();
    }

}
module.exports = new self().exports();