npx sequelize-cli model:generate --name users --force --attributes username:string,password:string,uuid:UUID,isActive:boolean,token:UUID 
npx sequelize-cli model:generate --name bookmarkPostsRelation --force --attributes postId:integer,profileId:integer,uuid:UUID 
npx sequelize-cli model:generate --name categoryOfPost --force --attributes type:string,postId:integer,uuid:UUID
npx sequelize-cli model:generate --name comments --force --attributes postId:integer,profileId:integer,reactionCount:integer,comment:string,uuid:UUID
npx sequelize-cli model:generate --name friendsRelation --force --attributes followerProfileId:integer,beingFollowedProfileId:integer,uuid:UUID
npx sequelize-cli model:generate --name posts --force --attributes profileId:integer,title:string,description:string,reactionCount:integer,uuid:UUID
npx sequelize-cli model:generate --name profiles --force --attributes userId:integer,profileImg:string,name:string,bio:string,followings:integer,followers:integer,uuid:UUID
npx sequelize-cli model:generate --name reactionOnComments --force --attributes reactionId:integer,commentId:integer,profileId:integer,uuid:UUID
npx sequelize-cli model:generate --name reactionOnPosts --force --attributes reactionId:integer,postId:integer,profileId:integer,uuid:UUID
npx sequelize-cli model:generate --name reactions --force --attributes reaction:char,uuid:UUID
npx sequelize-cli model:generate --name tagList --force --attributes tag:string,count:integer,image:string,color:string,description:string,followerCount:integer,uuid:UUID
npx sequelize-cli model:generate --name tagPostRelation --force --attributes tagId:integer,postId:integer,uuid:UUID
npx sequelize-cli model:generate --name tagUserRelation --force --attributes tagId:integer,profileId:integer,uuid:UUID
npx sequelize-cli model:generate --name hashtagFollowers --attributes profileId:integer,hashtagId:integer,uuid:UUID

npx sequelize-cli db:migrate