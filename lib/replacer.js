import scriptPool from './movie-scripts.json';
import insultPool from './insults.json';
import complimentPool from './compliments.json';
import wordPool from './word-pool.json';

export class Replacer {
  constructor() {
    this.words = wordPool;

    // run the special sauce script for special combos
    this.specialSauce();
  }

  //get a random number from a given range
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // this is a simple function for returning a random element from an array
  getRandom(theArr) {
    return theArr[this.getRandomNumber(0, theArr.length - 1)];
  }

  // performs a dice roll that is 1 in {odds} chance of returning true
  rollTheDice(odds) {
    return this.getRandomNumber(0, odds) === odds;
  }

  // get a random adjective and noun concatenated
  getRandomThing() {
    return this.getRandom(this.words['ADJ'])+' '+this.getRandom(this.words['NOUN']);
  }

  // pull a random insult or compliment and then populate with replacements
  getRandomPhrase(user, type = null) {
    const thingToSay = (type === "insult") ? this.getRandom(insultPool) : this.getRandom(complimentPool);
    this.words['USER'] = [user];

    return this.applyReplacements(thingToSay);
  }

  // pull a random script and populate it with replacements
  getGeneratedScript() {
    const theScript = this.getRandom(scriptPool);
    return this.applyReplacements(theScript);
  }

  // populate the replacement pools with a few special combos
  specialSauce() {
    const self = this;
    // const nounQty = Math.floor(this.words['NOUN'].length * 0.3);
    // let combos = [];

    // disabling this for now
    // for (var i = 0; i < nounQty; i++) {
    //   combos.push(self.getRandom(self.words['ADJ'])+' '+self.getRandom(self.words['NOUN']))
    // }
    // self.words['NOUN'] = self.words['NOUN'].concat(combos);

    // lets get some official titles in there
    self.words['TITLETWO'].forEach(function() {
      self.words['TITLE'].push(self.getRandom(self.words['TITLEONE'])+' '+self.getRandom(self.words['TITLETWO']));
    });

    // and some lady names
    self.words['FNAMEF'].forEach(function(theName) {
      self.words['FULLNAMEF'].push(theName+' '+self.getRandom(self.words['LNAME']));
    });

    // and some boy names
    self.words['FNAMEM'].forEach(function(theName) {
      self.words['FULLNAMEM'].push(theName+' '+self.getRandom(self.words['LNAME']));
    });
  }

  handleWordMods(word, modType) {
    let mod = '';

    switch(modType) {
      case 'plural':
        if (word.substring(word.length - 1, word.length) === 's') {
          mod = 'es';
        } else {
          mod = 's';
        }
        word = Object.keys(wordPool['NOUNPLURAL']).includes(word) ? wordPool['NOUNPLURAL'][word] : word.concat(mod);
        break;
      case 'capitalize':
        word = word.charAt(0).toUpperCase() + word.slice(1);
        break;
      case 'allcaps':
        word = word.toUpperCase();
        break;
      case 'past':
        if (word.substring(word.length - 1, word.length) === 'e') {
          mod = 'd';
        } else {
          mod = 'ed';
        }
        word = Object.keys(wordPool['VERBPAST']).includes(word) ? wordPool['VERBPAST'][word] : word.concat(mod);
        break;
    }
    return word;
  }

  getWordReplacement(replacement) {
    const self = this;
    let word = this.getRandom(this.words[replacement.type]);

    if (replacement.hasOwnProperty('mods')) {
      replacement.mods.forEach(function(modType) {
        word = self.handleWordMods(word, modType);
      });
    }

    return word;
  }

  applyReplacements(scriptObj) {
    const self = this;
    const replacements = {};
    let theScript = scriptObj.script;

    Object.keys(scriptObj.tokens).forEach(function(key) {
      replacements[key] = self.getWordReplacement(scriptObj.tokens[key]);
    });

    theScript.match(/{{.{0,}?}}/g).forEach(function(part) {
      theScript = theScript.replace(/{{.{0,}?}}/, replacements[part.replace(/\W/g, '')]);
    });

    return theScript;
  }
}
