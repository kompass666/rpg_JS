//
// 1. КЛАССЫ ОРУЖИЯ
//
class Weapon {
    constructor(name, attack, durability, range) {
      this.name = name;
      this.attack = attack;
      this.durability = durability;
      this.initDurability = durability; // для расчёта 30%-порога
      this.range = range;
    }
  
    takeDamage(damage) {
      this.durability = Math.max(0, this.durability - damage);
    }
  
    getDamage() {
      if (this.durability === 0) {
        return 0;
      }
      // Если прочность >= 30% от изначальной
      if (this.durability >= 0.3 * this.initDurability) {
        return this.attack;
      }
      // Иначе — половина
      return this.attack / 2;
    }
  
    isBroken() {
      return this.durability === 0;
    }
  }
  
  // — Базовые варианты
  class Arm extends Weapon {
    constructor() {
      super('Рука', 1, Infinity, 1);
    }
  }
  
  class Bow extends Weapon {
    constructor() {
      super('Лук', 10, 200, 3);
    }
  }
  
  class Sword extends Weapon {
    constructor() {
      super('Меч', 25, 500, 1);
    }
  }
  
  class Knife extends Weapon {
    constructor() {
      super('Нож', 5, 300, 1);
    }
  }
  
  class Staff extends Weapon {
    constructor() {
      super('Посох', 8, 300, 2);
    }
  }
  
  // — Улучшенные варианты
  class LongBow extends Bow {
    constructor() {
      super();
      this.name = 'Длинный лук';
      this.attack = 15;
      this.range = 4;
      this.initDurability = this.durability; // 200
    }
  }
  
  class Axe extends Sword {
    constructor() {
      super();
      this.name = 'Секира';
      this.attack = 27;
      this.durability = 800;
      this.initDurability = 800; 
      // range = 1
    }
  }
  
  class StormStaff extends Staff {
    constructor() {
      super();
      this.name = 'Посох Бури';
      this.attack = 10;
      this.range = 3;
      this.initDurability = this.durability; // 300
    }
  }
  
  //
  // 2. БАЗОВЫЙ КЛАСС PLAYER
  //
  class Player {
    constructor(position, name) {
      // Значения по умолчанию
      this.life = 100;
      this.magic = 20;
      this.speed = 1;
      this.attack = 10;
      this.agility = 5;
      this.luck = 10;
      this.description = 'Игрок';
      this.weapon = new Arm(); 
      this.position = position;
      this.name = name;
    }
  
    // Коэффициент удачи
    getLuck() {
      const randomNumber = Math.random() * 100; // 0..100
      return (randomNumber + this.luck) / 100;
    }
  
    // Логика getDamage(distance):
    // Если distance===0, мы НЕ делим на distance.
    // Если distance>0, обычная формула:
    //    (attack + weaponDamage) * getLuck() / distance
    // Если distance> weapon.range => 0
    getDamage(distance) {
      if (distance > this.weapon.range) {
        return 0; // не достаём
      }
      const weaponDamage = this.weapon.getDamage();
      const base = this.attack + weaponDamage;
  
      if (distance === 0) {
        // Бой в упор: без деления
        return base * this.getLuck();
      } else {
        // Обычная формула
        return base * this.getLuck() / distance;
      }
    }
  
    // Получить урон
    takeDamage(damage) {
      this.life = Math.max(0, this.life - damage);
      return this;
    }
  
    isDead() {
      return this.life === 0;
    }
  
    // Методы перемещения
    moveLeft(distance) {
      const actual = Math.min(distance, this.speed);
      this.position -= actual;
    }
  
    moveRight(distance) {
      const actual = Math.min(distance, this.speed);
      this.position += actual;
    }
  
    move(distance) {
      if (distance < 0) {
        this.moveLeft(Math.abs(distance));
      } else {
        this.moveRight(distance);
      }
    }
  
    // Блок и уворот
    isAttackBlocked() {
      const threshold = (100 - this.luck) / 100;
      return this.getLuck() > threshold;
    }
  
    dodged() {
      const threshold = (100 - this.agility - this.speed * 3) / 100;
      return this.getLuck() > threshold;
    }
  
    // Реакция на удар
    takeAttack(damage) {
      if (this.isAttackBlocked()) {
        console.log(`${this.name} заблокировал удар! Оружие получает урон=${damage.toFixed(2)}`);
        this.weapon.takeDamage(damage);
      } else if (this.dodged()) {
        console.log(`${this.name} уклонился от удара!`);
      } else {
        console.log(`${this.name} получил урон = ${damage.toFixed(2)}`);
        this.takeDamage(damage);
      }
      this.checkWeapon();
      return this;
    }
  
    // Проверка оружия (Knife -> Arm) 
    checkWeapon() {
      if (!this.weapon.isBroken()) {
        return;
      }
      console.log(`${this.name}: Оружие ${this.weapon.name} сломалось! Переключаюсь...`);
  
      if (!(this.weapon instanceof Knife) && !(this.weapon instanceof Arm)) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  
    // Попытка атаковать
    tryAttack(enemy) {
      // расстояние
      const distance = Math.abs(this.position - enemy.position);
      if (distance > this.weapon.range) {
        console.log(`${this.name} не достаёт до ${enemy.name} (dist=${distance}, range=${this.weapon.range})`);
        return;
      }
  
      // Износ оружия
      const dmgToWeapon = 10 * this.getLuck();
      this.weapon.takeDamage(dmgToWeapon);
  
      // Считаем урон
      let damage = this.getDamage(distance);
  
      // Если distance=0 — «бой в упор», урон удвоен + отбрасываем врага
      if (distance === 0) {
        console.log(`${this.name} бьёт в упор! Урон удвоен.`);
        enemy.position += 1; // отталкиваем
        damage *= 2;
      }
  
      console.log(`${this.name} наносит ${damage.toFixed(2)} урона по ${enemy.name}`);
      enemy.takeAttack(damage);
    }
  
    // Выбираем врага с минимальной life
    chooseEnemy(players) {
      const alive = players.filter((p) => !p.isDead() && p !== this);
      if (alive.length === 0) return null;
      let target = alive[0];
      for (let i = 1; i < alive.length; i++) {
        if (alive[i].life < target.life) {
          target = alive[i];
        }
      }
      return target;
    }
  
    // Движение к врагу
    moveToEnemy(enemy) {
      if (!enemy) return;
      const diff = enemy.position - this.position;
      if (diff > 0) {
        this.moveRight(Math.abs(diff));
      } else if (diff < 0) {
        this.moveLeft(Math.abs(diff));
      }
    }
  
    // Ход
    turn(players) {
      if (this.isDead()) {
        console.log(`${this.name} уже мертв, ход пропускает.`);
        return;
      }
      console.log(`\n--- Ход: ${this.name} (${this.description}) ---`);
      const enemy = this.chooseEnemy(players);
      if (!enemy) {
        console.log(`${this.name} не видит живых врагов!`);
        return;
      }
      this.moveToEnemy(enemy);
      this.tryAttack(enemy);
    }
  }
  
  //
  // 3. НАСЛЕДНИКИ
  //
  
  // Warrior
  class Warrior extends Player {
    constructor(position, name) {
      super(position, name);
      this.life = 120;
      // magic=20
      this.speed = 2;
      this.attack = 10;
      // agility=5, luck=10
      this.description = 'Воин';
      this.weapon = new Sword(); 
    }
  
    // При жизни<60 и getLuck()>0.8, урон в магию (если magic>0)
    takeDamage(damage) {
      const isLifeBelowHalf = this.life < 60;
      if (isLifeBelowHalf && this.getLuck() > 0.8 && this.magic > 0) {
        console.log(`${this.name} (Воин): поглощает урон магией!`);
        this.magic = Math.max(0, this.magic - damage);
        return this;
      }
      return super.takeDamage(damage);
    }
  
    // checkWeapon: Sword -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof Sword || this.weapon instanceof Axe) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  // Archer
  class Archer extends Player {
    constructor(position, name) {
      super(position, name);
      this.life = 80;
      this.magic = 35;
      // speed=1
      this.attack = 5;
      this.agility = 10;
      // luck=10
      this.description = 'Лучник';
      this.weapon = new Bow();
    }
  
    // Archer:
    //  (attack + weapDamage) * getLuck() * (distance / weap.range)
    getDamage(distance) {
      if (distance > this.weapon.range) {
        return 0;
      }
      const weaponDamage = this.weapon.getDamage();
      const base = this.attack + weaponDamage;
  
      if (distance === 0) {
        // бой в упор:
        return base * this.getLuck();
      } else {
        // обычная формула
        return base * this.getLuck() * (distance / this.weapon.range);
      }
    }
  
    // checkWeapon: Bow -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof Bow || this.weapon instanceof LongBow) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  // Mage
  class Mage extends Player {
    constructor(position, name) {
      super(position, name);
      this.life = 70;
      this.magic = 100;
      // speed=1
      this.attack = 5;
      this.agility = 8;
      // luck=10
      this.description = 'Маг';
      this.weapon = new Staff();
    }
  
    // При magic>50 => урон вдвое меньше + magic-=12
    takeDamage(damage) {
      if (this.magic > 50) {
        console.log(`${this.name} (Маг) уменьшает урон вдвое, тратит 12 маны.`);
        const half = damage / 2;
        this.life = Math.max(0, this.life - half);
        this.magic = Math.max(0, this.magic - 12);
        return this;
      }
      return super.takeDamage(damage);
    }
  
    // checkWeapon: Staff -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof Staff || this.weapon instanceof StormStaff) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  // Dwarf (улучшенный Warrior)
  class Dwarf extends Warrior {
    constructor(position, name) {
      super(position, name);
      this.life = 130;
      this.attack = 15;
      this.luck = 20;
      this.description = 'Гном';
      this.weapon = new Axe(); 
      this._incomingHitsCount = 0;
    }
  
    // Каждый 6-й удар по Гному в 2 раза слабее, если getLuck()>0.5
    takeDamage(damage) {
      this._incomingHitsCount++;
      if (this._incomingHitsCount % 6 === 0 && this.getLuck() > 0.5) {
        console.log(`${this.name} (Гном): 6-й удар, урон в 2 раза меньше!`);
        damage /= 2;
      }
      return super.takeDamage(damage);
    }
  
    // checkWeapon: Axe -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof Axe) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  // Crossbowman (улучшенный Archer)
  class Crossbowman extends Archer {
    constructor(position, name) {
      super(position, name);
      this.life = 85;
      // magic=35
      this.attack = 8;
      this.agility = 20;
      this.luck = 15;
      this.description = 'Арбалетчик';
      this.weapon = new LongBow(); 
    }
  
    // checkWeapon: LongBow -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof LongBow) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  // Demiurge (улучшенный Mage)
  class Demiurge extends Mage {
    constructor(position, name) {
      super(position, name);
      this.life = 80;
      this.magic = 120;
      this.attack = 6;
      // agility=8
      this.luck = 12;
      this.description = 'Демиург';
      this.weapon = new StormStaff();
    }
  
    // При magic>0 и getLuck()>0.6 => x1.5 урон
    getDamage(distance) {
      if (distance > this.weapon.range) {
        return 0;
      }
      const weaponDamage = this.weapon.getDamage();
      const base = this.attack + weaponDamage;
      let dmg;
      if (distance === 0) {
        dmg = base * this.getLuck();
      } else {
        dmg = base * this.getLuck() / distance;
      }
      if (this.magic > 0 && this.getLuck() > 0.6) {
        console.log(`${this.name} (Демиург): Сверхмощный удар x1.5!`);
        return dmg * 1.5;
      }
      return dmg;
    }
  
    // checkWeapon: StormStaff -> Knife -> Arm
    checkWeapon() {
      if (!this.weapon.isBroken()) return;
      console.log(`${this.name}: Сломался ${this.weapon.name}, меняю!`);
      if (this.weapon instanceof StormStaff) {
        this.weapon = new Knife();
      } else if (this.weapon instanceof Knife) {
        this.weapon = new Arm();
      }
    }
  }
  
  //
  // 4. ФУНКЦИЯ "КОРОЛЕВСКАЯ БИТВА"
  //
  function play(players) {
    let round = 1;
    while (true) {
      // Сколько живых?
      const alive = players.filter((p) => !p.isDead());
      if (alive.length <= 1) {
        // Или все мертвы, или 1
        break;
      }
      console.log(`\n===== Раунд №${round} =====`);
      for (let i = 0; i < players.length; i++) {
        if (!players[i].isDead()) {
          players[i].turn(players);
        }
      }
      round++;
    }
  
    // Результат
    const winner = players.find((p) => !p.isDead());
    if (!winner) {
      console.log('\nВсе погибли! Никто не выжил.');
    } else {
      console.log(`\nПобедитель: ${winner.name}, класс: ${winner.description}, жизнь: ${winner.life}`);
    }
  }
  
  //
  // 5. СОЗДАЁМ ГЕРОЕВ И ЗАПУСКАЕМ БОЙ
  //
  const warrior = new Warrior(0, 'Алёша Попович');
  const archer = new Archer(5, 'Леголас');
  const mage = new Mage(10, 'Гендальф');
  const dwarf = new Dwarf(-2, 'Гимли');
  const crossbowman = new Crossbowman(8, 'Орландо');
  const demiurge = new Demiurge(3, 'Николас Фламель');
  
  const players = [warrior, archer, mage, dwarf, crossbowman, demiurge];
  
  // Запускаем королевскую битву
  play(players);