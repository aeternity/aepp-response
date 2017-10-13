export default {
  namespaced: true,

  state: () => ({
    questions: [{
      content: 'When will the fossil fuel age be over?',
      amount: 1200,
      person: {
        imageUrl: 'https://pbs.twimg.com/profile_images/782474226020200448/zDo-gAo0_400x400.jpg',
        name: 'Elon Musk',
        twitter: 'elonmusk',
      },
      updatedAt: new Date(Date.now() - Math.round((Math.random() * 1000 * 60 * 60 * 24 * 360))),
    }, {
      content: 'What do you think about parallel universes?',
      amount: 45,
      person: {
        imageUrl: 'https://pbs.twimg.com/profile_images/2704868246/6c4104a0b8b99c5c24f5839537134cb6_400x400.png',
        name: 'Sadhguru',
        twitter: 'sadhgurujv',
      },
      updatedAt: new Date(Date.now() - Math.round((Math.random() * 1000 * 60 * 60 * 24 * 360))),
    }],
  }),
};
