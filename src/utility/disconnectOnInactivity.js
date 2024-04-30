// src/utility/disconnectOnInactivity.js

const disconnectOnInactivity = (connection, channel) => {
  let humansOnChannel = 0;
  channel.members.forEach((member) => {
    if (!member.user.bot) humansOnChannel++;
  });

  if (humansOnChannel) {
    console.log(
      `Humans connected to channel ${channel.name}, continuing connection.`
    );
    setTimeout(() => disconnectOnInactivity(connection, channel), 30000);
  } else {
    console.log(
      `No humans connected to channel ${channel.name}, disconnecting.`
    );
    connection.disconnect();
  }
};

export default disconnectOnInactivity;
