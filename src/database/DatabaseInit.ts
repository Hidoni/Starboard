import Database from './DatabaseObject';

if (process.env.DATABASE_PATH) {
    const db = new Database(process.env.DATABASE_PATH);

    db.sync();
    db.getGuildConfig('0').then((instance) => {console.log(instance.emoji, instance.guildId, instance.sfwChannelId, instance.isUnicode, instance.minimumReacts)});
} else {
    console.error("DATABASE_PATH env var is not defined");
}
